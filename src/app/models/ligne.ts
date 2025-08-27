import { Article } from './article';
export interface Ligne{
    id?: number;
    id_Article?: number;
    quantite?: number;
    Prix_HT?: number;
    Prix_TTC?: number;
    TVA?: number;
    MontantTTC : number
    article : Article
}
