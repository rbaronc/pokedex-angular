import { Component, HostListener } from '@angular/core';
import { FetchPokemonService } from 'src/app/services/fetch-pokemon.service';

import { Pokemon } from 'src/app/models';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent {
  public pokemons: Pokemon[] = [];

  constructor(private fetchPokemon: FetchPokemonService){
    this.fetchPokemon.pokemonListUpdater$.subscribe(pokemonList => this.pokemons = pokemonList);
    this.fetchPokemon.requestNewPokemon();
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          console.log('Reached botom');
      }
}
}
