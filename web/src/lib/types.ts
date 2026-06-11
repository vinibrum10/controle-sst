export type Papel = "ADMIN" | "GESTOR" | "COLABORADOR";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  provedor: string;
  funcionarioId: string | null;
}
