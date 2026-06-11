export interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  email: string;
  capacidade: number;
  foto: string | null;
  ativo: boolean;
}
