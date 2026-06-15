export interface CardData {
  id: string;
  name: string;
  pos: string;
  atk: number;
  def: number;
  owner?: 'player' | 'bot'; // Ahora es opcional
  nationality: string; // Código ISO de 3 letras
  image?: string;      // Ruta de la foto del jugador
  isLegend?: boolean;  // Identifica si es leyenda
}

export const MOCK_DECK: CardData[] = [
  // --- MAZO GLOBAL ---
  { id: 'c1', name: 'M. Ter Blocken', pos: 'POR', atk: 15, def: 88, nationality: 'GER', image: 'TerBlocken.png' }, // Real: Jugador 1
  { id: 'c2', name: 'U. Atún', pos: 'DEF', atk: 40, def: 85, nationality: 'ESP', image: '' },        // Real: Jugador 2
  { id: 'c3', name: 'P. Yolo', pos: 'DEF', atk: 35, def: 92, nationality: 'ESP', image: '', isLegend: true },        // Real: Jugador 3
  { id: 'c4', name: 'R. Carlitos', pos: 'DEF', atk: 75, def: 86, nationality: 'BRA', image: '', isLegend: true },    // Real: Jugador 4
  { id: 'c5', name: 'N. Ribera', pos: 'DEF', atk: 50, def: 84, nationality: 'ITA', image: '', isLegend: true },      // Real: Jugador 5
  { id: 'c6', name: 'K. Mirar', pos: 'MED', atk: 80, def: 85, nationality: 'BRA', image: '' },       // Real: Jugador 6
  { id: 'c7', name: 'Piedri', pos: 'MED', atk: 86, def: 60, nationality: 'ESP', image: 'Piedri.png' },         // Real: Jugador 7
  { id: 'c8', name: 'A. Gazpacho', pos: 'MED', atk: 85, def: 45, nationality: 'ARG', image: 'Gazpacho.png' },    // Real: Jugador 8
  { id: 'c9', name: 'L. Pessi', pos: 'DEL', atk: 98, def: 35, nationality: 'ARG', image: 'Pessi.png' },       // Real: Jugador 9
  { id: 'c10', name: 'Cris Rolando', pos: 'DEL', atk: 96, def: 40, nationality: 'POR', image: 'Rolando.png' },  // Real: Jugador 10
  { id: 'c11', name: 'L. Jamal', pos: 'DEL', atk: 88, def: 30, nationality: 'ESP', image: 'Tamal.png' },      // Real: Jugador 11

  { id: 'c12', name: 'I. Casitas', pos: 'POR', atk: 12, def: 90, nationality: 'ESP', image: 'Casitas.png', isLegend: true },        // Real: Jugador 12
  { id: 'c13', name: 'P. Maldino', pos: 'DEF', atk: 45, def: 95, nationality: 'ITA', image: 'Maldino.png', isLegend: true },        // Real: Jugador 13
  { id: 'c14', name: 'F. Beckenburger', pos: 'DEF', atk: 65, def: 94, nationality: 'GER', image: '', isLegend: true },   // Real: Jugador 14
  { id: 'c15', name: 'F. Carnivaro', pos: 'DEF', atk: 35, def: 91, nationality: 'ITA', image: 'Carnivaro.png', isLegend: true },      // Real: Jugador 15
  { id: 'c16', name: 'J. Zaneta', pos: 'DEF', atk: 55, def: 88, nationality: 'ARG', image: '', isLegend: true },         // Real: Jugador 16
  { id: 'c17', name: 'D. Macarrona', pos: 'MED', atk: 95, def: 40, nationality: 'ARG', image: 'Macarrona.png', isLegend: true },      // Real: Jugador 17
  { id: 'c18', name: 'Z. Zinedin', pos: 'MED', atk: 92, def: 55, nationality: 'FRA', image: 'Zinedin.png', isLegend: true },        // Real: Jugador 18
  { id: 'c19', name: 'Ronaldinbro', pos: 'MED', atk: 94, def: 45, nationality: 'BRA', image: 'Ronaldinbro.png', isLegend: true },       // Real: Jugador 19
  { id: 'c20', name: 'R. Lewangolski', pos: 'DEL', atk: 95, def: 40, nationality: 'POL', image: 'Lewangolski.png' },    // Real: Jugador 20
  { id: 'c21', name: 'M. Rushford', pos: 'DEL', atk: 89, def: 35, nationality: 'ENG', image: 'Rushford.png' }, // Real: Jugador 21
  { id: 'c22', name: 'H. Golazo', pos: 'DEL', atk: 91, def: 30, nationality: 'MEX', image: 'Golazo.png', isLegend: true },        // Real: Jugador 22
];