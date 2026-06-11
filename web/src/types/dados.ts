export interface ImportErro {
  tipo: string;
  indice: number;
  mensagem?: string;
}

export interface ImportResultado {
  funcionariosImportados: number;
  tarefasImportadas: number;
  erros: ImportErro[];
}
