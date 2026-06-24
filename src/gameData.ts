export interface CardData {
  id: string;
  name: string;
  pos: string;
  atk: number;
  def: number;
  owner?: 'player' | 'bot';
  nationality: string;
  image?: string;
  isLegend?: boolean;
}

export const MOCK_DECK: CardData[] = [
  // --- JUGADORES ACTUALES ---

  {
    id: 'c1',
    name: 'K. Mbagué',
    pos: 'DEL',
    atk: 94,
    def: 73,
    nationality: 'FRA',
    image: 'Mbague.png'
  },
  {
    id: 'c2',
    name: 'Vini Senior',
    pos: 'DEL',
    atk: 92,
    def: 69,
    nationality: 'BRA',
    image: 'ViniSenior.png'
  },
  {
    id: 'c6',
    name: 'E. Holanda',
    pos: 'DEL',
    atk: 94,
    def: 75,
    nationality: 'NOR',
    image: 'Holanda.png'
  },
  {
    id: 'c8',
    name: 'J. Bellocampo',
    pos: 'MED',
    atk: 88,
    def: 88,
    nationality: 'ENG',
    image: 'Bellocampo.png'
  },
  {
    id: 'c23',
    name: 'H. Huracán',
    pos: 'DEL',
    atk: 91,
    def: 77,
    nationality: 'ENG',
    image: 'Huracan.png'
  },
  {
    id: 'c24',
    name: 'T. Cortado',
    pos: 'POR',
    atk: 50,
    def: 97,
    nationality: 'BEL',
    image: 'Cortado.png'
  },
  {
    id: 'c25',
    name: 'F. De Pong',
    pos: 'MED',
    atk: 82,
    def: 89,
    nationality: 'NED',
    image: 'DePong.png'
  },

  // Valor provisional: carta débil, pero ya no pierde automáticamente.
  {
    id: 'c26',
    name: 'G. Yariel',
    pos: 'MED',
    atk: 68,
    def: 71,
    nationality: 'MEX',
    image: 'Pamperzy.png'
  },

  // --- LEYENDAS DEFENSIVAS ---

  {
    id: 'c3',
    name: 'P. Yolo',
    pos: 'DEF',
    atk: 62,
    def: 95,
    nationality: 'ESP',
    image: 'Yolo.png',
    isLegend: true
  },
  {
    id: 'c4',
    name: 'R. Carlitos',
    pos: 'DEF',
    atk: 80,
    def: 91,
    nationality: 'BRA',
    image: 'Carlitos.png',
    isLegend: true
  },

  // Si está basado en Gianni Rivera, su posición correcta sería MED.
  {
    id: 'c5',
    name: 'N. Ribera',
    pos: 'MED',
    atk: 88,
    def: 79,
    nationality: 'ITA',
    image: 'Ribera.png',
    isLegend: true
  },
  {
    id: 'c12',
    name: 'I. Casitas',
    pos: 'POR',
    atk: 48,
    def: 96,
    nationality: 'ESP',
    image: 'Casitas.png',
    isLegend: true
  },
  {
    id: 'c13',
    name: 'P. Maldino',
    pos: 'DEF',
    atk: 68,
    def: 97,
    nationality: 'ITA',
    image: 'Maldino.png',
    isLegend: true
  },
  {
    id: 'c14',
    name: 'F. Beckenburger',
    pos: 'DEF',
    atk: 78,
    def: 95,
    nationality: 'GER',
    image: 'Beckenburger.png',
    isLegend: true
  },
  {
    id: 'c15',
    name: 'F. Carnivaro',
    pos: 'DEF',
    atk: 62,
    def: 96,
    nationality: 'ITA',
    image: 'Carnivaro.png',
    isLegend: true
  },
  {
    id: 'c16',
    name: 'J. Zaneta',
    pos: 'DEF',
    atk: 76,
    def: 93,
    nationality: 'ARG',
    image: 'Zaneta.png',
    isLegend: true
  },

  // --- MEDIOCAMPISTAS Y DELANTEROS ---

  {
    id: 'c7',
    name: 'Piedri',
    pos: 'MED',
    atk: 85,
    def: 83,
    nationality: 'ESP',
    image: 'Piedri.png'
  },
  {
    id: 'c9',
    name: 'L. Pessi',
    pos: 'DEL',
    atk: 96,
    def: 71,
    nationality: 'ARG',
    image: 'Pessi.png'
  },
  {
    id: 'c10',
    name: 'Cris Rolando',
    pos: 'DEL',
    atk: 95,
    def: 73,
    nationality: 'POR',
    image: 'Rolando.png'
  },
  {
    id: 'c11',
    name: 'L. Jamal',
    pos: 'DEL',
    atk: 89,
    def: 67,
    nationality: 'ESP',
    image: 'Tamal.png'
  },
  {
    id: 'c17',
    name: 'D. Macarrona',
    pos: 'MED',
    atk: 95,
    def: 73,
    nationality: 'ARG',
    image: 'Macarrona.png',
    isLegend: true
  },
  {
    id: 'c18',
    name: 'Z. Zinedin',
    pos: 'MED',
    atk: 91,
    def: 85,
    nationality: 'FRA',
    image: 'Zinedin.png',
    isLegend: true
  },
  {
    id: 'c19',
    name: 'Ronaldinbro',
    pos: 'MED',
    atk: 93,
    def: 75,
    nationality: 'BRA',
    image: 'Ronaldinbro.png',
    isLegend: true
  },
  {
    id: 'c20',
    name: 'R. LLewangolski',
    pos: 'DEL',
    atk: 92,
    def: 74,
    nationality: 'POL',
    image: 'Lewangolski.png'
  },
  {
    id: 'c21',
    name: 'M. Rushford',
    pos: 'DEL',
    atk: 86,
    def: 68,
    nationality: 'ENG',
    image: 'Rushford.png'
  },
  {
    id: 'c22',
    name: 'H. Golazo',
    pos: 'DEL',
    atk: 92,
    def: 70,
    nationality: 'MEX',
    image: 'Golazo.png',
    isLegend: true
  },
   {
    id: 'c27',
    name: 'Neymarte',
    pos: 'DEL',
    atk: 93,
    def: 72,
    nationality: 'BRA',
    image: 'Neymarte.png'
  }, // Real: Neymar Jr.

  {
    id: 'c28',
    name: 'O. Dembeléctrico',
    pos: 'DEL',
    atk: 92,
    def: 71,
    nationality: 'FRA',
    image: 'Dembelectrico.png'
  }, // Real: Ousmane Dembélé

  {
    id: 'c29',
    name: 'K. Kvaratsalsa',
    pos: 'DEL',
    atk: 93,
    def: 76,
    nationality: 'GEO',
    image: 'Kvaratsalsa.png'
  }, // Real: Khvicha Kvaratskhelia

  {
    id: 'c30',
    name: 'Vitiño',
    pos: 'MED',
    atk: 88,
    def: 88,
    nationality: 'POR',
    image: 'Vitino.png'
  }, // Real: Vitinha

  {
    id: 'c31',
    name: 'R. Rodillo',
    pos: 'MED',
    atk: 84,
    def: 93,
    nationality: 'ESP',
    image: 'Rodillo.png'
  }, // Real: Rodri Hernández

  {
    id: 'c32',
    name: 'J. Musicala',
    pos: 'MED',
    atk: 90,
    def: 82,
    nationality: 'GER',
    image: 'Musicala.png'
  }, // Real: Jamal Musiala

  {
    id: 'c33',
    name: 'F. Würst',
    pos: 'MED',
    atk: 89,
    def: 84,
    nationality: 'GER',
    image: 'Wurst.png'
  }, // Real: Florian Wirtz

  {
    id: 'c34',
    name: 'A. Hákimelo',
    pos: 'DEF',
    atk: 84,
    def: 91,
    nationality: 'MAR',
    image: 'Hakimelo.png'
  }, // Real: Achraf Hakimi

  {
    id: 'c35',
    name: 'V. Van Dique',
    pos: 'DEF',
    atk: 68,
    def: 96,
    nationality: 'NED',
    image: 'VanDique.png'
  }, // Real: Virgil van Dijk

  {
    id: 'c36',
    name: 'W. Saliva',
    pos: 'DEF',
    atk: 65,
    def: 95,
    nationality: 'FRA',
    image: 'Saliva.png'
  }, // Real: William Saliba

  {
    id: 'c37',
    name: 'G. DoñaRumores',
    pos: 'POR',
    atk: 52,
    def: 96,
    nationality: 'ITA',
    image: 'DonaRumores.png'
  }, // Real: Gianluigi Donnarumma

  {
    id: 'c38',
    name: 'C. PulpoSic',
    pos: 'DEL',
    atk: 87,
    def: 72,
    nationality: 'USA',
    image: 'PulpoSic.png'
  }, // Real: Christian Pulisic

  {
    id: 'c39',
    name: 'F. Valleverde',
    pos: 'MED',
    atk: 87,
    def: 91,
    nationality: 'URU',
    image: 'Valleverde.png'
  }, // Real: Federico Valverde

  {
    id: 'c40',
    name: 'J. Arañvarez',
    pos: 'DEL',
    atk: 91,
    def: 76,
    nationality: 'ARG',
    image: 'Aranvarez.png'
  }, // Real: Julián Álvarez

  {
    id: 'c41',
    name: 'B. Saca',
    pos: 'DEL',
    atk: 89,
    def: 75,
    nationality: 'ENG',
    image: 'Saca.png'
  }, // Real: Bukayo Saka


  // ============================================================
  // NUEVAS LEYENDAS — MUNDIAL / CHAMPIONS
  // ============================================================

  {
    id: 'c42',
    name: 'G. Bufón',
    pos: 'POR',
    atk: 50,
    def: 98,
    nationality: 'ITA',
    image: 'Bufon.png',
    isLegend: true
  }, // Real: Gianluigi Buffon

  {
    id: 'c43',
    name: 'S. Ramones',
    pos: 'DEF',
    atk: 74,
    def: 96,
    nationality: 'ESP',
    image: 'Ramones.png',
    isLegend: true
  }, // Real: Sergio Ramos

  {
    id: 'c44',
    name: 'A. Siesta',
    pos: 'MED',
    atk: 92,
    def: 84,
    nationality: 'ESP',
    image: 'Siesta.png',
    isLegend: true
  }, // Real: Andrés Iniesta

  {
    id: 'c45',
    name: 'Chavi Meriendas',
    pos: 'MED',
    atk: 88,
    def: 90,
    nationality: 'ESP',
    image: 'ChaviMeriendas.png',
    isLegend: true
  }, // Real: Xavi Hernández

  {
    id: 'c46',
    name: 'R. Nazareno',
    pos: 'DEL',
    atk: 97,
    def: 76,
    nationality: 'BRA',
    image: 'Nazareno.png',
    isLegend: true
  } // Real: Ronaldo Nazário
];