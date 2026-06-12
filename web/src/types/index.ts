export type Papel = "ADMIN" | "GESTOR" | "TST" | "VISUALIZADOR" | "COLABORADOR";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  provedor: string;
  funcionarioId: string | null;
}
