import { Article } from './article';
import { Depot } from './depot';
export interface Stock{
    quantiteFinale: number;
    quantiteEntree: number;
    quantiteSortie: number;
    article: Article;
    depot: Depot;
}
