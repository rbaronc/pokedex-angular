import { NameAndURL } from "./BaseModels";

export interface PokemonSpecies {
    base_happiness: number;
    capture_rate: number;
    color: NameAndURL;
    egg_groups: NameAndURL[];
    evolution_chain: EvolutionChain;
    evolves_from_species?: any;
    flavor_text_entries: FlavorTextEntry[];
    form_descriptions: any[];
    forms_switchable: boolean;
    gender_rate: number;
    genera: Genus[];
    generation: NameAndURL;
    growth_rate: NameAndURL;
    habitat: NameAndURL;
    has_gender_differences: boolean;
    hatch_counter: number;
    id: number;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    name: string;
    names: Name[];
    order: number;
    pal_park_encounters: PalParkEncounter[];
    pokedex_numbers: PokedexNumber[];
    shape: NameAndURL;
    varieties: Variety[];
}

interface Variety {
    is_default: boolean;
    pokemon: NameAndURL;
}

interface PokedexNumber {
    entry_number: number;
    pokedex: NameAndURL;
}

interface PalParkEncounter {
    area: NameAndURL;
    base_score: number;
    rate: number;
}

interface Name {
    language: NameAndURL;
    name: string;
}

interface Genus {
    genus: string;
    language: NameAndURL;
}

interface FlavorTextEntry {
    flavor_text: string;
    language: NameAndURL;
    version: NameAndURL;
}

interface EvolutionChain {
    url: string;
}