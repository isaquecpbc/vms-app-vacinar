import { Clinica } from "./clinica.model";

export interface CampanhaClinica {
    id: number;
    campanhaId: number;
    clinicas: Array<Clinica>
}
