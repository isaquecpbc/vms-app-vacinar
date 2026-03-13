import { CampanhaCombinated } from "./campanha-combinated.model";
import { ConveniadaCombinated } from "./conveniada-combinated.model";
import { ParticipanteCombinated } from "./participante-combinated.model";
import { UsuarioCombinated } from "./usuario-combinated.model";
import { VacinaCombinated } from "./vacina-combinated.model";

export interface Aplicacao extends
    CampanhaCombinated, ConveniadaCombinated,
    ParticipanteCombinated, UsuarioCombinated,
    VacinaCombinated {
    id: number;
    dose: number;
    loteId: number;
    dtAplicacao: string;
    dtAplicacao2: string;
    dtAplicacaoFormated: string;
    dtAtualizacao: string;
    dtCriacao: string;
    dtExclusao: string;
    status: number;
    conveniadaCidadeAplicada: string;
    conveniadaFantasiaAplicada: string;
    conveniadaRazaoAplicada: string;
    conveniadaUfAplicada: string;
    conveniadaId2: number;
    profissionalId: number;
    empresaId: number;
}

