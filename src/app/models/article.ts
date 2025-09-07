import { Categorie } from './categorie';
export interface Article {
    id: number;
    id_Categorie: number;
    code?: string;
    designation: string;
    description?: string;
    prixA_HT?: number;
    prixA_TTC?: number;
    prixV_HT?: number;
    prixV_TTC?: number;
    tva?: number;
    image?: string;
    created_at?: Date;
    updated_at?: Date;
    categorie: Categorie
}
