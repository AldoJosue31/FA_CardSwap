export interface CardData {
  id: string;
  name: string;
  pos: string;
  atk: number;
  def: number;
  owner: 'player' | 'bot';
  nationality: string; // Código ISO de 3 letras
  image?: string;      // Ruta de la foto del jugador
}

export const MOCK_DECK: CardData[] = [
  // --- MAZO DEL JUGADOR (11 CARTAS) ---
  { id: 'p1', name: 'M. Ter Blocken', pos: 'POR', atk: 15, def: 88, owner: 'player', nationality: 'GER', image: '' }, // Real: Marc-André ter Stegen
  { id: 'p2', name: 'U. Atún', pos: 'DEF', atk: 40, def: 85, owner: 'player', nationality: 'ESP', image: '' },        // Real: Pau Torres / Aymeric Laporte
  { id: 'p3', name: 'P. Yolo', pos: 'DEF', atk: 35, def: 92, owner: 'player', nationality: 'ESP', image: '' },        // Real: Carles Puyol
  { id: 'p4', name: 'R. Carlitos', pos: 'DEF', atk: 75, def: 86, owner: 'player', nationality: 'BRA', image: '' },    // Real: Roberto Carlos
  { id: 'p5', name: 'N. Ribera', pos: 'DEF', atk: 50, def: 84, owner: 'player', nationality: 'ITA', image: '' },      // Real: Alessandro Nesta / Nicolò Barella
  { id: 'p6', name: 'K. Mirar', pos: 'MED', atk: 80, def: 85, owner: 'player', nationality: 'BRA', image: '' },       // Real: Casemiro
  { id: 'p7', name: 'Piedri', pos: 'MED', atk: 86, def: 60, owner: 'player', nationality: 'ESP', image: '' },         // Real: Pedri
  { id: 'p8', name: 'A. Gazpacho', pos: 'MED', atk: 85, def: 45, owner: 'player', nationality: 'ARG', image: '' },    // Real: Alejandro Garnacho
  { id: 'p9', name: 'L. Pessi', pos: 'DEL', atk: 98, def: 35, owner: 'player', nationality: 'ARG', image: '' },       // Real: Lionel Messi
  { id: 'p10', name: 'Cris Rolando', pos: 'DEL', atk: 96, def: 40, owner: 'player', nationality: 'POR', image: '' },  // Real: Cristiano Ronaldo
  { id: 'p11', name: 'L. Jamal', pos: 'DEL', atk: 88, def: 30, owner: 'player', nationality: 'ESP', image: '' },      // Real: Lamine Yamal

  // --- MAZO DEL BOT (11 CARTAS) ---
  { id: 'b1', name: 'I. Casitas', pos: 'POR', atk: 12, def: 90, owner: 'bot', nationality: 'ESP', image: '' },        // Real: Iker Casillas
  { id: 'b2', name: 'P. Maldino', pos: 'DEF', atk: 45, def: 95, owner: 'bot', nationality: 'ITA', image: '' },        // Real: Paolo Maldini
  { id: 'b3', name: 'F. Beckenburger', pos: 'DEF', atk: 65, def: 94, owner: 'bot', nationality: 'GER', image: '' },   // Real: Franz Beckenbauer
  { id: 'b4', name: 'F. Carnivaro', pos: 'DEF', atk: 35, def: 91, owner: 'bot', nationality: 'ITA', image: '' },      // Real: Fabio Cannavaro
  { id: 'b5', name: 'J. Zaneta', pos: 'DEF', atk: 55, def: 88, owner: 'bot', nationality: 'ARG', image: '' },         // Real: Javier Zanetti
  { id: 'b6', name: 'D. Macarrona', pos: 'MED', atk: 95, def: 40, owner: 'bot', nationality: 'ARG', image: '' },      // Real: Diego Maradona
  { id: 'b7', name: 'Z. Zinedin', pos: 'MED', atk: 92, def: 55, owner: 'bot', nationality: 'FRA', image: '' },        // Real: Zinedine Zidane
  { id: 'b8', name: 'Ronaldinbro', pos: 'MED', atk: 94, def: 45, owner: 'bot', nationality: 'BRA', image: 'Ronaldinbro.png' },       // Real: Ronaldinho
  { id: 'b9', name: 'R. Lewangolski', pos: 'DEL', atk: 95, def: 40, owner: 'bot', nationality: 'POL', image: 'Lewangolski.png' },    // Real: Robert Lewandowski
  { id: 'b10', name: 'M. Rushford', pos: 'DEL', atk: 89, def: 35, owner: 'bot', nationality: 'ENG', image: 'Rushford.png' }, // Real: Marcus Rashford
  { id: 'b11', name: 'H. Golazo', pos: 'DEL', atk: 91, def: 30, owner: 'bot', nationality: 'MEX', image: '' },        // Real: Hugo Sánchez
];