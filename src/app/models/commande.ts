import { Client } from "./client";
import { Ligne } from "./ligne";

export interface Commande{

    id?: number;
    typeIntervenant: string;
    Id_intervenant : number;
    code: string;
    dateCommande: Date;
    createdAt: Date;
    updatedAt?: Date;
    montantTotal: number;
    client: Client;
    lignes: Ligne[];
}

