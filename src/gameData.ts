export interface CardData {
  id: string;
  name: string;
  pos: string;
  atk: number;
  def: number;
  owner: 'player' | 'bot';
}

export const MOCK_DECK: CardData[] = [
  // Tu Mano (Mezcla de estrellas parodiadas)
  { id: 'p1', name: 'L. PESSI', pos: 'DEL', atk: 95, def: 30, owner: 'player' },
  { id: 'p2', name: 'R. LEWANGOLSKI', pos: 'DEL', atk: 90, def: 35, owner: 'player' },
  { id: 'p3', name: 'PIEDRI', pos: 'MED', atk: 82, def: 65, owner: 'player' },
  { id: 'p4', name: 'L. JAMAL', pos: 'DEL', atk: 85, def: 40, owner: 'player' },
  { id: 'p5', name: 'B. HERNANDEZ', pos: 'MED', atk: 86, def: 60, owner: 'player' },
  { id: 'p6', name: 'A. GAZPACHO', pos: 'DEL', atk: 83, def: 45, owner: 'player' },
  { id: 'p7', name: 'M. RUSHFORD', pos: 'MED', atk: 81, def: 40, owner: 'player' },
  { id: 'p8', name: 'U. ATÚN', pos: 'MED', atk: 79, def: 50, owner: 'player' },
  { id: 'p9', name: 'N. RIBERA', pos: 'DEF', atk: 60, def: 82, owner: 'player' },
  { id: 'p10', name: 'M. TER BLOCKEN', pos: 'POR', atk: 15, def: 90, owner: 'player' },
  { id: 'p11', name: 'K. MIRAR', pos: 'POR', atk: 12, def: 88, owner: 'player' },
  { id: 'p12', name: 'P. POGBOMBA', pos: 'MED', atk: 84, def: 70, owner: 'player' },
  { id: 'p13', name: 'A. DI MARIO', pos: 'DEL', atk: 88, def: 35, owner: 'player' },
  { id: 'p14', name: 'S. RAMA', pos: 'DEF', atk: 65, def: 90, owner: 'player' },
  { id: 'p15', name: 'G. PICHU', pos: 'POR', atk: 10, def: 85, owner: 'player' },

  // Mano del Bot (Superestrellas globales parodiadas)
  { id: 'b1', name: 'C. ROLANDO', pos: 'DEL', atk: 94, def: 35, owner: 'bot' },
  { id: 'b2', name: 'K. MFRAPPÉ', pos: 'DEL', atk: 96, def: 30, owner: 'bot' },
  { id: 'b3', name: 'E. HOOLAND', pos: 'DEL', atk: 95, def: 40, owner: 'bot' },
  { id: 'b4', name: 'BINI JR.', pos: 'DEL', atk: 92, def: 35, owner: 'bot' },
  { id: 'b5', name: 'J. BELLINGTON', pos: 'MED', atk: 88, def: 75, owner: 'bot' },
  { id: 'b6', name: 'K. DE BROWN', pos: 'MED', atk: 89, def: 65, owner: 'bot' },
  { id: 'b7', name: 'L. MODRICH', pos: 'MED', atk: 85, def: 70, owner: 'bot' },
  { id: 'b8', name: 'V. VAN BRICK', pos: 'DEF', atk: 40, def: 95, owner: 'bot' },
  { id: 'b9', name: 'R. DÍAS', pos: 'DEF', atk: 35, def: 92, owner: 'bot' },
  { id: 'b10', name: 'T. ARNOLDO', pos: 'DEF', atk: 70, def: 80, owner: 'bot' },
  { id: 'b11', name: 'T. COURTIS', pos: 'POR', atk: 10, def: 96, owner: 'bot' },
];