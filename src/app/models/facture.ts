import { Client } from "./client";
import { Fournisseur } from "./fournisseur";
import { Ligne } from "./ligne";

export interface Facture{

    id?: number;
    typeIntervenant: string;
    Id_intervenant : number;
    id_depot : number;
    code: string;
    dateFacture: Date;
    createdAt: Date;
    updatedAt?: Date;
    montantTotal: number;
    client?: Client;
    fournisseur ?:Fournisseur;
    lignes: Ligne[];
}

