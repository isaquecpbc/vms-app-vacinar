import { ContatoCombinated } from "./contato-combinated.model";
import { EnderecoCombinated } from "./endereco-combinated.model";
import { InfoEmpresaCombinated } from "./infoEmpresa-combinated.model";

export interface Clinica extends
    EnderecoCombinated, ContatoCombinated, InfoEmpresaCombinated {
    id: number;
    dtCriacao: string;
    status: number;
    atendeUnidade: string;
    contatoMedico: string;
    dtExclusao: string;
}
