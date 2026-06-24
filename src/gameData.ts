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
  // --- NUEVOS JUGADORES (Mundial 2026 / UCL 25-26) ---
  { id: 'c1', name: 'K. Mbagué', pos: 'DEL', atk: 97, def: 35, nationality: 'FRA', image: 'Mbague.png' },       // Real: Kylian Mbappé
  { id: 'c2', name: 'Vini Senior', pos: 'DEL', atk: 95, def: 30, nationality: 'BRA', image: 'ViniSenior.png' }, // Real: Vinícius Júnior
  { id: 'c6', name: 'E. Holanda', pos: 'DEL', atk: 96, def: 40, nationality: 'NOR', image: 'Holanda.png' },     // Real: Erling Haaland
  { id: 'c8', name: 'J. Bellocampo', pos: 'MED', atk: 92, def: 75, nationality: 'ENG', image: 'Bellocampo.png' },// Real: Jude Bellingham
  { id: 'c23', name: 'H. Huracán', pos: 'DEL', atk: 93, def: 45, nationality: 'ENG', image: 'Huracan.png' },    // Real: Harry Kane
  { id: 'c24', name: 'T. Cortado', pos: 'POR', atk: 15, def: 94, nationality: 'BEL', image: 'Cortado.png' },    // Real: Thibaut Courtois
  { id: 'c25', name: 'F. De Pong', pos: 'MED', atk: 84, def: 80, nationality: 'NED', image: 'DePong.png' },
  { id: 'c26', name: 'G. Yariel', pos: 'MED', atk: -99, def: -99, nationality: 'MEX', image: 'Pamperzy.png' },      // Real: Frenkie de Jong

  // --- LEYENDAS (Conservadas del mazo original) ---
  { id: 'c3', name: 'P. Yolo', pos: 'DEF', atk: 35, def: 92, nationality: 'ESP', image: 'Yolo.png', isLegend: true },            // Real: Carles Puyol
  { id: 'c4', name: 'R. Carlitos', pos: 'DEF', atk: 75, def: 86, nationality: 'BRA', image: 'Carlitos.png', isLegend: true },        // Real: Roberto Carlos
  { id: 'c5', name: 'N. Ribera', pos: 'DEF', atk: 50, def: 84, nationality: 'ITA', image: 'Ribera.png', isLegend: true },          // Real: Gianni Rivera
  { id: 'c12', name: 'I. Casitas', pos: 'POR', atk: 12, def: 90, nationality: 'ESP', image: 'Casitas.png', isLegend: true },// Real: Iker Casillas
  { id: 'c13', name: 'P. Maldino', pos: 'DEF', atk: 45, def: 95, nationality: 'ITA', image: 'Maldino.png', isLegend: true },// Real: Paolo Maldini
  { id: 'c14', name: 'F. Beckenburger', pos: 'DEF', atk: 65, def: 94, nationality: 'GER', image: 'Beckenburger.png', isLegend: true },   // Real: Franz Beckenbauer
  { id: 'c15', name: 'F. Carnivaro', pos: 'DEF', atk: 35, def: 91, nationality: 'ITA', image: 'Carnivaro.png', isLegend: true },// Real: Fabio Cannavaro
  { id: 'c16', name: 'J. Zaneta', pos: 'DEF', atk: 55, def: 88, nationality: 'ARG', image: 'Zaneta.png', isLegend: true },         // Real: Javier Zanetti

  // --- LEYENDAS Y JUGADORES SOLICITADOS (Manteniendo ID y foto exacta) ---
  { id: 'c7', name: 'Piedri', pos: 'MED', atk: 86, def: 60, nationality: 'ESP', image: 'Piedri.png' },                 // Real: Pedri
  { id: 'c9', name: 'L. Pessi', pos: 'DEL', atk: 98, def: 35, nationality: 'ARG', image: 'Pessi.png' },                // Real: Lionel Messi
  { id: 'c10', name: 'Cris Rolando', pos: 'DEL', atk: 96, def: 40, nationality: 'POR', image: 'Rolando.png' },         // Real: Cristiano Ronaldo
  { id: 'c11', name: 'L. Jamal', pos: 'DEL', atk: 88, def: 30, nationality: 'ESP', image: 'Tamal.png' },               // Real: Lamine Yamal
  { id: 'c17', name: 'D. Macarrona', pos: 'MED', atk: 95, def: 40, nationality: 'ARG', image: 'Macarrona.png', isLegend: true },// Real: Diego Maradona
  { id: 'c18', name: 'Z. Zinedin', pos: 'MED', atk: 92, def: 55, nationality: 'FRA', image: 'Zinedin.png', isLegend: true },  // Real: Zinedine Zidane
  { id: 'c19', name: 'Ronaldinbro', pos: 'MED', atk: 94, def: 45, nationality: 'BRA', image: 'Ronaldinbro.png', isLegend: true },// Real: Ronaldinho
  { id: 'c20', name: 'R. LLewangolski', pos: 'DEL', atk: 95, def: 40, nationality: 'POL', image: 'Lewangolski.png' },  // Real: Robert Lewandowski
  { id: 'c21', name: 'M. Rushford', pos: 'DEL', atk: 89, def: 35, nationality: 'ENG', image: 'Rushford.png' },         // Real: Marcus Rashford
  { id: 'c22', name: 'H. Golazo', pos: 'DEL', atk: 91, def: 30, nationality: 'MEX', image: 'Golazo.png', isLegend: true } // Real: Hugo Sánchez
];