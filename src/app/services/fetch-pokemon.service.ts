import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { POKEMON_API_V2_URL } from 'src/constants/urls';
import { Pokemon, NameAndURL, PokemonSpecies, APIPokemon, ProcessedPokemonList, RawPokemonList } from '../models';
import { Observable, Subject, Subscription, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FetchPokemonService {
  private lastPokemonId = 0;
  private nextPageInList: string | null = null;
  public pokemonListUpdater$ = new Subject<Pokemon[]>();

  constructor(private httpClient: HttpClient) {}

  public requestNewPokemon(): void {
    console.log('new Pokemon requested');
    this.fillPokemonList();
  }

  private fillPokemonList(): void {
    const canServiceGetMorePokemon = this.nextPageInList || (this.nextPageInList === null && this.lastPokemonId === 0);
    if (canServiceGetMorePokemon) {
      const url = this.nextPageInList || `${POKEMON_API_V2_URL}/pokemon/?offset=${this.lastPokemonId}&limit=48`;
      
      const httpGetSubscription: Subscription = this.httpClient
        .get<RawPokemonList>(url)
        .pipe(map(rawPokemonList => {
          return this.processRawPokemonList(rawPokemonList);
        }))
        .subscribe({
          next: (pokemonsObserver) => {
            let pokemonList: Pokemon[] = [];
            pokemonsObserver.subscribe({
              next: pokemons => {
                pokemonList = pokemons;
              },
              complete: () => this.pokemonListUpdater$.next(pokemonList)
            });
          },
          complete: () => httpGetSubscription.unsubscribe(),
          error: error => this.pokemonListUpdater$.error(error)
        });
    } else {
      this.pokemonListUpdater$.complete();
    }
  }

  private getPokemonIDFromAPIResult(result: NameAndURL): string {
    const id = result.url.split("/").find((bit: string) => !isNaN(parseInt(bit)));
    return id || '';
  }

  private getPokemonSpecies(pokemonID: string): Observable<PokemonSpecies> {
    return this.httpClient.get<PokemonSpecies>(`${POKEMON_API_V2_URL}/pokemon-species/${pokemonID}`);    
  }

  private getPokemon(pokemonID: string): Observable<Pokemon> {
    const pokemonObs$ = this.httpClient.get<APIPokemon>(`${POKEMON_API_V2_URL}/pokemon/${pokemonID}`);
    const pokemonSpeciesObs$ = this.getPokemonSpecies(pokemonID);
    const observable = new Subject<Pokemon>();

    const forkSubscription = forkJoin({pokemon: pokemonObs$, pokemonSpecies: pokemonSpeciesObs$})
      .subscribe({
        next: ({pokemon, pokemonSpecies}) => {
          observable.next({
            name: pokemon.name, 
            id: pokemon.id, 
            listImageURL: pokemon?.sprites?.other?.dream_world?.front_default,
            showDownImage: pokemon?.sprites?.other?.showdown?.front_default,
            description: this.getDescription(pokemonSpecies)
          });
          forkSubscription.unsubscribe();
          observable.complete();
        }
      });

      return observable;
  }

  private getDescription(pokemonSpecies: PokemonSpecies): string {
    const englishEntries = pokemonSpecies.flavor_text_entries.filter((entry) => (entry.language.name == "en")).map((entry) => ({text: entry.flavor_text}));
    const latestEntry = englishEntries.at(-1);

    return latestEntry? latestEntry?.text: '';
  }

  private processRawPokemonList(rawPokemonList: RawPokemonList): Observable<Pokemon[]> {
    const observable = new Subject<Pokemon[]>();
    const pokemonObservables: Observable<Pokemon>[] = [];
    this.nextPageInList = rawPokemonList.next;    

    rawPokemonList.results.map((rawPokemon: NameAndURL) => {
      const pokemonId = this.getPokemonIDFromAPIResult(rawPokemon);
      pokemonObservables.push(this.getPokemon(pokemonId));
    });

    const forkSubscription = forkJoin(pokemonObservables)
    .subscribe({
      next: pokemons => {
        observable.next(Object.values(pokemons));
        forkSubscription.unsubscribe();
        observable.complete();
      }
    });

    return observable;
  }
}
