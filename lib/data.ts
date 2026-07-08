export interface RouteRequest {
  from: string;
  to: string;
  accessibilityRequired: boolean;
  crowdDensity: Record<string, number>;
  language: string;
}

export interface StadiumNode {
  id: string;
  name: Record<string, string>; // Language code -> name
  type: 'gate' | 'concourse' | 'section' | 'elevator' | 'stairs' | 'restroom' | 'medical' | 'food' | 'quiet_room';
  accessibilityFeatures?: string[];
}

export interface StadiumEdge {
  from: string;
  to: string;
  baseWeight: number; // travel weight (e.g. minutes)
  accessible: boolean; // if wheelchair/mobility-friendly
  description: Record<string, string>; // Path detail in multiple languages
}

export interface SustainabilityTip {
  title: Record<string, string>;
  details: Record<string, string>;
}

export interface SustainabilityData {
  transport: SustainabilityTip[];
  waste: SustainabilityTip[];
}

export const NODES: Record<string, StadiumNode> = {
  gate_a: {
    id: 'gate_a',
    type: 'gate',
    name: {
      en: 'Gate A (West Entrance)',
      es: 'Puerta A (Entrada Oeste)',
      fr: 'Porte A (Entrée Ouest)',
      pt: 'Portão A (Entrada Oeste)',
      ar: 'بوابة A (المدخل الغربي)'
    },
    accessibilityFeatures: ['Accessible ramp', 'Touchless security scanner']
  },
  gate_b: {
    id: 'gate_b',
    type: 'gate',
    name: {
      en: 'Gate B (East Entrance)',
      es: 'Puerta B (Entrada Este)',
      fr: 'Porte B (Entrée Est)',
      pt: 'Portão B (Entrada Leste)',
      ar: 'بوابة B (المدخل الشرقي)'
    },
    accessibilityFeatures: ['Accessible ramp', 'Audio assistance desk']
  },
  gate_c: {
    id: 'gate_c',
    type: 'gate',
    name: {
      en: 'Gate C (West Concourse entrance)',
      es: 'Puerta C (Entrada Concourse Oeste)',
      fr: 'Porte C (Entrée Hall Ouest)',
      pt: 'Portão C (Entrada do Concourse Oeste)',
      ar: 'بوابة C (مدخل الممر الغربي)'
    },
    accessibilityFeatures: ['Accessible ramp']
  },
  gate_d: {
    id: 'gate_d',
    type: 'gate',
    name: {
      en: 'Gate D (East Concourse entrance)',
      es: 'Puerta D (Entrada Concourse Este)',
      fr: 'Porte D (Entrée Hall Est)',
      pt: 'Portão D (Entrada do Concourse Leste)',
      ar: 'بوابة D (مدخل الممر الشرقي)'
    },
    accessibilityFeatures: ['Accessible ramp']
  },
  concourse_lower_west: {
    id: 'concourse_lower_west',
    type: 'concourse',
    name: {
      en: 'Lower Concourse (West Side)',
      es: 'Concourse Inferior (Lado Oeste)',
      fr: 'Hall Inférieur (Côté Ouest)',
      pt: 'Concourse Inferior (Lado Oeste)',
      ar: 'الممر السفلي (الجانب الغربي)'
    }
  },
  concourse_lower_east: {
    id: 'concourse_lower_east',
    type: 'concourse',
    name: {
      en: 'Lower Concourse (East Side)',
      es: 'Concourse Inferior (Lado Este)',
      fr: 'Hall Inférieur (Côté Est)',
      pt: 'Concourse Inferior (Lado Leste)',
      ar: 'الممر السفلي (الجانب الشرقي)'
    }
  },
  concourse_upper_west: {
    id: 'concourse_upper_west',
    type: 'concourse',
    name: {
      en: 'Upper Concourse (West Side)',
      es: 'Concourse Superior (Lado Oeste)',
      fr: 'Hall Supérieur (Côté Ouest)',
      pt: 'Concourse Superior (Lado Oeste)',
      ar: 'الممر العلوي (الجانب الغربي)'
    }
  },
  concourse_upper_east: {
    id: 'concourse_upper_east',
    type: 'concourse',
    name: {
      en: 'Upper Concourse (East Side)',
      es: 'Concourse Superior (Lado Este)',
      fr: 'Hall Supérieur (Côté Est)',
      pt: 'Concourse Superior (Lado Leste)',
      ar: 'الممر العلوي (الجانب الشرقي)'
    }
  },
  sec_101: {
    id: 'sec_101',
    type: 'section',
    name: {
      en: 'Section 101 (Lower West)',
      es: 'Sección 101 (Inferior Oeste)',
      fr: 'Section 101 (Bas Ouest)',
      pt: 'Seção 101 (Inferior Oeste)',
      ar: 'القسم 101 (السفلي الغربي)'
    },
    accessibilityFeatures: ['Accessible seating row', 'Companion seating']
  },
  sec_102: {
    id: 'sec_102',
    type: 'section',
    name: {
      en: 'Section 102 (Lower West)',
      es: 'Sección 102 (Inferior Oeste)',
      fr: 'Section 102 (Bas Ouest)',
      pt: 'Seção 102 (Inferior Oeste)',
      ar: 'القسم 102 (السفلي الغربي)'
    },
    accessibilityFeatures: ['Accessible seating row']
  },
  sec_110: {
    id: 'sec_110',
    type: 'section',
    name: {
      en: 'Section 110 (Lower East)',
      es: 'Sección 110 (Inferior Este)',
      fr: 'Section 110 (Bas Est)',
      pt: 'Seção 110 (Inferior Leste)',
      ar: 'القسم 110 (السفلي الشرقي)'
    },
    accessibilityFeatures: ['Accessible seating row']
  },
  sec_111: {
    id: 'sec_111',
    type: 'section',
    name: {
      en: 'Section 111 (Lower East)',
      es: 'Sección 111 (Inferior Este)',
      fr: 'Section 111 (Bas Est)',
      pt: 'Seção 111 (Inferior Leste)',
      ar: 'القسم 111 (السفلي الشرقي)'
    },
    accessibilityFeatures: ['Accessible seating row', 'Companion seating']
  },
  sec_201: {
    id: 'sec_201',
    type: 'section',
    name: {
      en: 'Section 201 (Upper West)',
      es: 'Sección 201 (Superior Oeste)',
      fr: 'Section 201 (Haut Ouest)',
      pt: 'Seção 201 (Superior Oeste)',
      ar: 'القسم 201 (العلوي الغربي)'
    },
    accessibilityFeatures: ['Accessible seating row']
  },
  sec_202: {
    id: 'sec_202',
    type: 'section',
    name: {
      en: 'Section 202 (Upper West)',
      es: 'Sección 202 (Superior Oeste)',
      fr: 'Section 202 (Haut Ouest)',
      pt: 'Seção 202 (Superior Oeste)',
      ar: 'القسم 202 (العلوي الغربي)'
    }
  },
  sec_210: {
    id: 'sec_210',
    type: 'section',
    name: {
      en: 'Section 210 (Upper East)',
      es: 'Sección 210 (Superior Este)',
      fr: 'Section 210 (Haut Est)',
      pt: 'Seção 210 (Superior Leste)',
      ar: 'القسم 210 (العلوي الشرقي)'
    },
    accessibilityFeatures: ['Accessible seating row']
  },
  sec_211: {
    id: 'sec_211',
    type: 'section',
    name: {
      en: 'Section 211 (Upper East)',
      es: 'Sección 211 (Superior Este)',
      fr: 'Section 211 (Haut Est)',
      pt: 'Seção 211 (Superior Leste)',
      ar: 'القسم 211 (العلوي الشرقي)'
    },
    accessibilityFeatures: ['Accessible seating row', 'Companion seating']
  },
  elevator_west: {
    id: 'elevator_west',
    type: 'elevator',
    name: {
      en: 'Elevator West (Access to Upper Levels)',
      es: 'Ascensor Oeste (Acceso a Niveles Superiores)',
      fr: 'Ascenseur Ouest (Accès aux Niveaux Supérieurs)',
      pt: 'Elevador Oeste (Acesso aos Níveis Superiores)',
      ar: 'المصعد الغربي (الوصول للمستويات العليا)'
    },
    accessibilityFeatures: ['Braille buttons', 'Audio announcements', 'Wheelchair dimensions']
  },
  elevator_east: {
    id: 'elevator_east',
    type: 'elevator',
    name: {
      en: 'Elevator East (Access to Upper Levels)',
      es: 'Ascensor Este (Acceso a Niveles Superiores)',
      fr: 'Ascenseur Est (Accès aux Niveaux Supérieurs)',
      pt: 'Elevador Leste (Acesso aos Níveis Superiores)',
      ar: 'المصعد الشرقي (الوصول للمستويات العليا)'
    },
    accessibilityFeatures: ['Braille buttons', 'Audio announcements', 'Wheelchair dimensions']
  },
  stairs_west: {
    id: 'stairs_west',
    type: 'stairs',
    name: {
      en: 'West Concourse Stairs (Stairs only)',
      es: 'Escaleras del Concourse Oeste (Solo escaleras)',
      fr: 'Escaliers du Hall Ouest (Escaliers uniquement)',
      pt: 'Escadas do Concourse Oeste (Apenas escadas)',
      ar: 'سلالم الممر الغربي (سلالم فقط)'
    }
  },
  stairs_east: {
    id: 'stairs_east',
    type: 'stairs',
    name: {
      en: 'East Concourse Stairs (Stairs only)',
      es: 'Escaleras del Concourse Este (Solo escaleras)',
      fr: 'Escaliers du Hall Est (Escaliers uniquement)',
      pt: 'Escadas do Concourse Leste (Apenas escadas)',
      ar: 'سلالم الممر الشرقي (سلالم فقط)'
    }
  },
  restroom_std_east: {
    id: 'restroom_std_east',
    type: 'restroom',
    name: {
      en: 'Standard Restroom (Lower East)',
      es: 'Baño Estándar (Inferior Este)',
      fr: 'Toilettes Standard (Bas Est)',
      pt: 'Banheiro Padrão (Inferior Leste)',
      ar: 'دورات مياه قياسية (السفلية الشرقية)'
    }
  },
  restroom_acc_west: {
    id: 'restroom_acc_west',
    type: 'restroom',
    name: {
      en: 'Accessible Restroom (Lower West)',
      es: 'Baño Accesible (Inferior Oeste)',
      fr: 'Toilettes Accessibles (Bas Ouest)',
      pt: 'Banheiro Acessível (Inferior Oeste)',
      ar: 'دورات مياه ميسرة (السفلية الغربية)'
    },
    accessibilityFeatures: ['Wheelchair accessible stall', 'Grab bars', 'Lowered sink', 'Emergency alarm button']
  },
  restroom_acc_east: {
    id: 'restroom_acc_east',
    type: 'restroom',
    name: {
      en: 'Accessible Restroom (Upper East)',
      es: 'Baño Accesible (Superior Este)',
      fr: 'Toilettes Accessibles (Haut Est)',
      pt: 'Banheiro Acessível (Superior Leste)',
      ar: 'دورات مياه ميسرة (العلوية الشرقية)'
    },
    accessibilityFeatures: ['Wheelchair accessible stall', 'Grab bars', 'Lowered sink']
  },
  medical_west: {
    id: 'medical_west',
    type: 'medical',
    name: {
      en: 'First Aid & Medical Station (Lower West)',
      es: 'Estación Médica y Primeros Auxilios (Inferior Oeste)',
      fr: 'Poste de Premiers Secours (Bas Ouest)',
      pt: 'Posto Médico e de Primeiros Socorros (Inferior Oeste)',
      ar: 'العيادة الطبية والإسعافات الأولية (السفلية الغربية)'
    },
    accessibilityFeatures: ['Fully accessible entrance', 'Low-height registration counter']
  },
  medical_east: {
    id: 'medical_east',
    type: 'medical',
    name: {
      en: 'First Aid & Medical Station (Lower East)',
      es: 'Estación Médica y Primeros Auxilios (Inferior Este)',
      fr: 'Poste de Premiers Secours (Bas Est)',
      pt: 'Posto Médico e de Primeiros Socorros (Inferior Leste)',
      ar: 'العيادة الطبية والإسعافات الأولية (السفلية الشرقية)'
    },
    accessibilityFeatures: ['Fully accessible entrance']
  },
  food_tacos_west: {
    id: 'food_tacos_west',
    type: 'food',
    name: {
      en: 'Eco Taco Stand (Lower West)',
      es: 'Puesto de Eco Tacos (Inferior Oeste)',
      fr: 'Stand de Tacos Éco (Bas Ouest)',
      pt: 'Eco Taco Stand (Inferior Oeste)',
      ar: 'منصة التاكو الصديقة للبيئة (السفلية الغربية)'
    },
    accessibilityFeatures: ['Lowered ordering counter']
  },
  food_burgers_east: {
    id: 'food_burgers_east',
    type: 'food',
    name: {
      en: 'Green Grill Burgers (Lower East)',
      es: 'Hamburguesas Green Grill (Inferior Este)',
      fr: 'Burgers Green Grill (Bas Est)',
      pt: 'Green Grill Burgers (Inferior Leste)',
      ar: 'منصة البرجر المشوي الأخضر (السفلية الشرقية)'
    }
  },
  sensory_quiet_west: {
    id: 'sensory_quiet_west',
    type: 'quiet_room',
    name: {
      en: 'Sensory Quiet Room (Lower West - Gate A/C)',
      es: 'Sala Sensorial Silenciosa (Inferior Oeste - Puerta A/C)',
      fr: 'Salle Sensorielle Calme (Bas Ouest - Porte A/C)',
      pt: 'Sala Sensorial Silenciosa (Inferior Oeste - Portão A/C)',
      ar: 'الغرفة الحسية الهادئة (السفلية الغربية - بوابة A/C)'
    },
    accessibilityFeatures: ['Soundproofing', 'Weighted blankets', 'Dimmable lights', 'Sensory tools']
  }
};

export const EDGES: StadiumEdge[] = [
  // Gates to Concourse Lower West
  {
    from: 'gate_a',
    to: 'concourse_lower_west',
    baseWeight: 2,
    accessible: true,
    description: {
      en: 'Walk straight through Gate A ramp onto the West Concourse.',
      es: 'Camine directo por la rampa de la Puerta A hacia el Concourse Oeste.',
      fr: 'Passez la rampe de la Porte A pour rejoindre le Hall Ouest.',
      pt: 'Caminhe direto pela rampa do Portão A em direção ao Concourse Oeste.',
      ar: 'امشِ مباشرة عبر منحدر البوابة A إلى الممر الغربي.'
    }
  },
  {
    from: 'gate_c',
    to: 'concourse_lower_west',
    baseWeight: 2,
    accessible: true,
    description: {
      en: 'Proceed through Gate C entrance corridors to the West Concourse.',
      es: 'Proceda por los pasillos de entrada de la Puerta C hacia el Concourse Oeste.',
      fr: 'Avancez par les couloirs de la Porte C vers le Hall Ouest.',
      pt: 'Siga pelos corredores de entrada do Portão C até o Concourse Oeste.',
      ar: 'تقدم عبر ممرات مدخل البوابة C إلى الممر الغربي.'
    }
  },

  // Gates to Concourse Lower East
  {
    from: 'gate_b',
    to: 'concourse_lower_east',
    baseWeight: 2,
    accessible: true,
    description: {
      en: 'Walk straight through Gate B ramp onto the East Concourse.',
      es: 'Camine directo por la rampa de la Puerta B hacia el Concourse Este.',
      fr: 'Passez la rampe de la Porte B pour rejoindre le Hall Est.',
      pt: 'Caminhe direto pela rampa do Portão B em direção ao Concourse Leste.',
      ar: 'امشِ مباشرة عبر منحدر البوابة B إلى الممر الشرقي.'
    }
  },
  {
    from: 'gate_d',
    to: 'concourse_lower_east',
    baseWeight: 2,
    accessible: true,
    description: {
      en: 'Proceed through Gate D entrance corridors to the East Concourse.',
      es: 'Proceda por los pasillos de entrada de la Puerta D hacia el Concourse Este.',
      fr: 'Avancez par les couloirs de la Porte D vers le Hall Est.',
      pt: 'Siga pelos corredores de entrada do Portão D até o Concourse Leste.',
      ar: 'تقدم عبر ممرات مدخل البوابة D إلى الممر الشرقي.'
    }
  },

  // Central Walkway linking Lower East and West
  {
    from: 'concourse_lower_west',
    to: 'concourse_lower_east',
    baseWeight: 5,
    accessible: true,
    description: {
      en: 'Walk along the main lower concourse corridor connecting West and East sides.',
      es: 'Camine por el pasillo principal del concourse inferior que conecta el lado Oeste y Este.',
      fr: 'Suivez le couloir principal du hall inférieur reliant l\'Est et l\'Ouest.',
      pt: 'Caminhe pelo corredor principal do concourse inferior ligando as alas Oeste e Leste.',
      ar: 'امشِ على طول ممر الممر السفلي الرئيسي الذي يربط بين الجانبين الغربي والشرقي.'
    }
  },

  // Lower West Sections & Facilities
  {
    from: 'concourse_lower_west',
    to: 'sec_101',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Take the Section 101 entry portal on your left.',
      es: 'Tome el portal de entrada de la Sección 101 a su izquierda.',
      fr: 'Entrez par le portail de la Section 101 sur votre gauche.',
      pt: 'Entre pelo portal de acesso à Seção 101 à sua esquerda.',
      ar: 'دخل عبر بوابة القسم 101 على يسارك.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'sec_102',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Take the Section 102 entry portal on your right.',
      es: 'Tome el portal de entrada de la Sección 102 a su derecha.',
      fr: 'Entrez par le portail de la Section 102 sur votre droite.',
      pt: 'Entre pelo portal de acesso à Seção 102 à sua direita.',
      ar: 'دخل عبر بوابة القسم 102 على يمينك.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'restroom_acc_west',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Head into the wheelchair-accessible restroom corridor next to Section 101.',
      es: 'Diríjase al pasillo de baños accesibles para sillas de ruedas al lado de la Sección 101.',
      fr: 'Dirigez-vous vers le couloir des toilettes accessibles aux fauteuils à côté de la Section 101.',
      pt: 'Dirija-se ao corredor de banheiros acessíveis ao lado da Seção 101.',
      ar: 'توجه إلى ممر دورات المياه الميسرة المخصص للكراسي المتحركة بجوار القسم 101.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'medical_west',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the First Aid Station, located between Section 101 and Section 102.',
      es: 'Camine a la Estación de Primeros Auxilios, ubicada entre la Sección 101 y la Sección 102.',
      fr: 'Rendez-vous au poste de premiers secours entre la Section 101 et la Section 102.',
      pt: 'Caminhe até o Posto de Primeiros Socorros, localizado entre as Seções 101 e 102.',
      ar: 'توجه إلى عيادة الإسعافات الأولية الواقعة بين القسم 101 والقسم 102.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'food_tacos_west',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk up to the Eco Taco Stand opposite Section 102.',
      es: 'Camine hacia el Puesto de Eco Tacos frente a la Sección 102.',
      fr: 'Avancez vers le stand Eco Tacos en face de la Section 102.',
      pt: 'Dirija-se ao Eco Taco Stand em frente à Seção 102.',
      ar: 'توجه إلى منصة التاكو الصديقة للبيئة المقابلة للقسم 102.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'sensory_quiet_west',
    baseWeight: 2,
    accessible: true,
    description: {
      en: 'Follow signs to the Sensory Quiet Room, located in a noise-insulated corridor behind Gate A.',
      es: 'Siga las indicaciones hacia la Sala Sensorial Silenciosa, ubicada en un pasillo aislado del ruido detrás de la Puerta A.',
      fr: 'Suivez les panneaux vers la Salle Sensorielle Calme, située dans un couloir insonorisé derrière la Porte A.',
      pt: 'Siga as placas para a Sala Sensorial Silenciosa, localizada em um corredor com isolamento acústico atrás do Portão A.',
      ar: 'اتبع اللوحات الإرشادية إلى الغرفة الحسية الهادئة، الواقعة في ممر معزول عن الضوضاء خلف البوابة A.'
    }
  },

  // Lower East Sections & Facilities
  {
    from: 'concourse_lower_east',
    to: 'sec_110',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Take the Section 110 entry portal on your left.',
      es: 'Tome el portal de entrada de la Sección 110 a su izquierda.',
      fr: 'Entrez par le portail de la Section 110 sur votre gauche.',
      pt: 'Entre pelo portal de acesso à Seção 110 à sua esquerda.',
      ar: 'دخل عبر بوابة القسم 110 على يسارك.'
    }
  },
  {
    from: 'concourse_lower_east',
    to: 'sec_111',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Take the Section 111 entry portal on your right.',
      es: 'Tome el portal de entrada de la Sección 111 a su derecha.',
      fr: 'Entrez par le portail de la Section 111 sur votre droite.',
      pt: 'Entre pelo portal de acesso à Seção 111 à sua direita.',
      ar: 'دخل عبر بوابة القسم 111 على يمينك.'
    }
  },
  {
    from: 'concourse_lower_east',
    to: 'restroom_std_east',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Enter the standard restrooms located adjacent to Section 110.',
      es: 'Ingrese a los baños estándar ubicados junto a la Sección 110.',
      fr: 'Entrez dans les toilettes standard situées à côté de la Section 110.',
      pt: 'Acesse os banheiros comuns localizados ao lado da Seção 110.',
      ar: 'ادخل إلى دورات المياه القياسية الواقعة بجوار القسم 110.'
    }
  },
  {
    from: 'concourse_lower_east',
    to: 'medical_east',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the East First Aid Station next to Section 111.',
      es: 'Camine a la Estación de Primeros Auxilios Este al lado de la Sección 111.',
      fr: 'Rendez-vous au poste de secours Est à côté de la Section 111.',
      pt: 'Caminhe até o Posto Médico Leste ao lado da Seção 111.',
      ar: 'توجه إلى عيادة الإسعافات الأولية الشرقية بجوار القسم 111.'
    }
  },
  {
    from: 'concourse_lower_east',
    to: 'food_burgers_east',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the Green Grill Burgers stall opposite Section 110.',
      es: 'Camine al puesto de hamburguesas Green Grill frente a la Sección 110.',
      fr: 'Rendez-vous au stand de burgers Green Grill en face de la Section 110.',
      pt: 'Dirija-se à lanchonete Green Grill Burgers oposta à Seção 110.',
      ar: 'توجه إلى كشك البرجر المشوي الأخضر المقابل للقسم 110.'
    }
  },

  // Transition: Lower West to Upper West (Elevator vs Stairs)
  {
    from: 'concourse_lower_west',
    to: 'elevator_west',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the West Concourse elevator bay.',
      es: 'Camine a la zona de ascensores del Concourse Oeste.',
      fr: 'Dirigez-vous vers les ascenseurs du Hall Ouest.',
      pt: 'Caminhe até a ala do Elevador Oeste.',
      ar: 'امشِ إلى منطقة المصعد في الممر الغربي.'
    }
  },
  {
    from: 'elevator_west',
    to: 'concourse_upper_west',
    baseWeight: 4,
    accessible: true,
    description: {
      en: 'Take the elevator up to the Upper West Concourse level.',
      es: 'Tome el ascensor hacia el nivel del Concourse Superior Oeste.',
      fr: 'Montez en ascenseur jusqu\'au Hall Supérieur Ouest.',
      pt: 'Suba pelo elevador até o nível do Concourse Superior Oeste.',
      ar: 'استخدم المصعد للصعود إلى مستوى الممر العلوي الغربي.'
    }
  },
  {
    from: 'concourse_lower_west',
    to: 'stairs_west',
    baseWeight: 1,
    accessible: false,
    description: {
      en: 'Walk to the West concourse stairway.',
      es: 'Camine a la escalera del Concourse Oeste.',
      fr: 'Dirigez-vous vers la cage d\'escalier du Hall Ouest.',
      pt: 'Dirija-se às escadarias do Concourse Oeste.',
      ar: 'امشِ إلى بيت الدرج في الممر الغربي.'
    }
  },
  {
    from: 'stairs_west',
    to: 'concourse_upper_west',
    baseWeight: 2,
    accessible: false,
    description: {
      en: 'Walk up the stairs to the Upper West Concourse level.',
      es: 'Suba las escaleras hacia el nivel del Concourse Superior Oeste.',
      fr: 'Montez les marches jusqu\'au Hall Supérieur Ouest.',
      pt: 'Suba as escadas até o nível do Concourse Superior Oeste.',
      ar: 'اصعد الدرج إلى مستوى الممر العلوي الغربي.'
    }
  },

  // Transition: Lower East to Upper East (Elevator vs Stairs)
  {
    from: 'concourse_lower_east',
    to: 'elevator_east',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the East Concourse elevator bay.',
      es: 'Camine a la zona de ascensores del Concourse Este.',
      fr: 'Dirigez-vous vers les ascenseurs du Hall Est.',
      pt: 'Caminhe até a ala do Elevador Leste.',
      ar: 'امشِ إلى منطقة المصعد في الممر الشرقي.'
    }
  },
  {
    from: 'elevator_east',
    to: 'concourse_upper_east',
    baseWeight: 4,
    accessible: true,
    description: {
      en: 'Take the elevator up to the Upper East Concourse level.',
      es: 'Tome el ascensor hacia el nivel del Concourse Superior Este.',
      fr: 'Montez en ascenseur jusqu\'au Hall Supérieur Est.',
      pt: 'Suba pelo elevador até o nível do Concourse Superior Leste.',
      ar: 'استخدم المصعد للصعود إلى مستوى الممر العلوي الشرقي.'
    }
  },
  {
    from: 'concourse_lower_east',
    to: 'stairs_east',
    baseWeight: 1,
    accessible: false,
    description: {
      en: 'Walk to the East concourse stairway.',
      es: 'Camine a la escalera del Concourse Este.',
      fr: 'Dirigez-vous vers la cage d\'escalier du Hall Est.',
      pt: 'Dirija-se às escadarias do Concourse Leste.',
      ar: 'امشِ إلى بيت الدرج في الممر الشرقي.'
    }
  },
  {
    from: 'stairs_east',
    to: 'concourse_upper_east',
    baseWeight: 2,
    accessible: false,
    description: {
      en: 'Walk up the stairs to the Upper East Concourse level.',
      es: 'Suba las escaleras hacia el nivel del Concourse Superior Este.',
      fr: 'Montez les marches jusqu\'au Hall Supérieur Est.',
      pt: 'Suba as escadas até o nível do Concourse Superior Leste.',
      ar: 'اصعد الدرج إلى مستوى الممر العلوي الشرقي.'
    }
  },

  // Upper West Sections
  {
    from: 'concourse_upper_west',
    to: 'sec_201',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the entry for Section 201.',
      es: 'Camine a la entrada de la Sección 201.',
      fr: 'Dirigez-vous vers la Section 201.',
      pt: 'Dirija-se ao portal de acesso à Seção 201.',
      ar: 'امشِ إلى مدخل القسم 201.'
    }
  },
  {
    from: 'concourse_upper_west',
    to: 'sec_202',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the entry for Section 202.',
      es: 'Camine a la entrada de la Sección 202.',
      fr: 'Dirigez-vous vers la Section 202.',
      pt: 'Dirija-se ao portal de acesso à Seção 202.',
      ar: 'امشِ إلى مدخل القسم 202.'
    }
  },

  // Upper East Sections & Facilities
  {
    from: 'concourse_upper_east',
    to: 'sec_210',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the entry for Section 210.',
      es: 'Camine a la entrada de la Sección 210.',
      fr: 'Dirigez-vous vers la Section 210.',
      pt: 'Dirija-se ao portal de acesso à Seção 210.',
      ar: 'امشِ إلى مدخل القسم 210.'
    }
  },
  {
    from: 'concourse_upper_east',
    to: 'sec_211',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Walk to the entry for Section 211.',
      es: 'Camine a la entrada de la Sección 211.',
      fr: 'Dirigez-vous vers la Section 211.',
      pt: 'Dirija-se ao portal de acesso à Seção 211.',
      ar: 'امشِ إلى مدخل القسم 211.'
    }
  },
  {
    from: 'concourse_upper_east',
    to: 'restroom_acc_east',
    baseWeight: 1,
    accessible: true,
    description: {
      en: 'Access the Upper East wheelchair-accessible restroom next to Section 211.',
      es: 'Acceda al baño accesible para sillas de ruedas del Concourse Superior Este junto a la Sección 211.',
      fr: 'Accédez aux toilettes accessibles du Hall Supérieur Est à côté de la Section 211.',
      pt: 'Acesse o banheiro acessível do Concourse Superior Leste ao lado da Seção 211.',
      ar: 'ادخل إلى دورات المياه الميسرة العلوية الشرقية بجوار القسم 211.'
    }
  },

  // Upper walkway linking East and West concourses
  {
    from: 'concourse_upper_west',
    to: 'concourse_upper_east',
    baseWeight: 6,
    accessible: true,
    description: {
      en: 'Walk along the upper concourse bridge connecting East and West sides.',
      es: 'Camine por el puente del concourse superior que conecta el lado Este y Oeste.',
      fr: 'Suivez la passerelle du hall supérieur reliant l\'Est et l\'Ouest.',
      pt: 'Caminhe pela ponte do concourse superior ligando as alas Leste e Oeste.',
      ar: 'امشِ عبر جسر الممر العلوي الذي يربط بين الجانبين الشرقي والغربي.'
    }
  }
];

// Complete the bi-directional setup automatically in the graph algorithm
// or define both directions. To avoid code bloat, we will write our routing algorithm
// to treat these edges as undirected (bi-directional), which is perfect for a stadium.

export const SUSTAINABILITY_DATA: SustainabilityData = {
  transport: [
    {
      title: {
        en: 'Electric Shuttle Buses',
        es: 'Autobuses Eléctricos de Enlace',
        fr: 'Navettes Électriques',
        pt: 'Ônibus de Traslado Elétrico',
        ar: 'حافلات النقل الكهربائية المشتركة'
      },
      details: {
        en: 'Free zero-emission electric shuttles run every 5 minutes from Gate A and Gate B to the metro link and main parking hub.',
        es: 'Lanzaderas eléctricas gratuitas de cero emisiones pasan cada 5 minutos desde la Puerta A y B hacia la estación de metro y estacionamiento principal.',
        fr: 'Des navettes électriques gratuites et sans émission circulent toutes les 5 minutes depuis les Portes A et B vers le métro et le parking principal.',
        pt: 'Traslados elétricos gratuitos com emissão zero circulam a cada 5 minutos dos Portões A e B para a estação de metrô e estacionamento principal.',
        ar: 'تتوفر حافلات نقل كهربائية مجانية خالية من الانبعاثات كل 5 دقائق من البوابة A والبوابة B إلى محطة المترو ومواقف السيارات الرئيسية.'
      }
    },
    {
      title: {
        en: 'Bicycle Micro-mobility Hub',
        es: 'Centro de Micro-movilidad para Bicicletas',
        fr: 'Pôle Vélo & Micro-mobilité',
        pt: 'Bicicletário e Micro-mobilidade',
        ar: 'مركز الدراجات الهوائية والنقل المصغر'
      },
      details: {
        en: 'Secure bike racks and a free valet bike station are located outside Gate C. Enjoy free tune-ups during the match!',
        es: 'Estacionamiento seguro de bicicletas y servicio de valet gratuito se encuentran fuera de la Puerta C. ¡Disfrute de afinación gratuita durante el partido!',
        fr: 'Des arceaux de stationnement sécurisés et un service de voiturier vélo gratuit sont situés devant la Porte C. Entretien gratuit pendant le match !',
        pt: 'Racks seguros para bicicletas e uma estação gratuita de valet de bicicletas estão localizados do lado de fora do Portão C. Ajustes gratuitos estão disponíveis durante a partida!',
        ar: 'تتوفر مواقف آمنة للدراجات الهوائية وخدمة مجانية لركن الدراجات خارج البوابة C. استمتع بصيانة مجانية خلال المباراة!'
      }
    }
  ],
  waste: [
    {
      title: {
        en: 'Green Eco-Stations',
        es: 'Eco-Estaciones Verdes',
        fr: 'Éco-Stations de Tri',
        pt: 'Eco-Estações de Triagem',
        ar: 'المحطات البيئية الخضراء لإعادة التدوير'
      },
      details: {
        en: 'Look for the color-coded waste stations near Section 101 and Section 110. Volunteers are on-site to help separate compostables, plastics, and paper.',
        es: 'Busque las estaciones de residuos codificadas por colores cerca de la Sección 101 y 110. Hay voluntarios para ayudar a separar compost, plástico y papel.',
        fr: 'Repérez les bacs de tri de couleurs près des Sections 101 et 110. Des bénévoles vous guident pour trier compostables, plastiques et papier.',
        pt: 'Procure as estações de resíduos sinalizadas perto das Seções 101 e 110. Voluntários ajudam na triagem de compostáveis, plásticos e papel.',
        ar: 'ابحث عن محطات النفايات الملونة بالقرب من القسم 101 والقسم 110. يتواجد متطوعون لمساعدتك في فصل المواد العضوية والبلاستيكية والورقية.'
      }
    },
    {
      title: {
        en: 'Reusable Cup Return Program',
        es: 'Programa de Devolución de Vasos Reutilizables',
        fr: 'Retour des Gobelets Réutilisables',
        pt: 'Programa de Retorno de Copos Reutilizáveis',
        ar: 'برنامج إرجاع الأكواب القابلة لإعادة الاستخدام'
      },
      details: {
        en: 'Return your official FIFA World Cup reusable cup to any food kiosk (like the Eco Taco Stand or Green Grill Burgers) to claim your deposit or donate it to green charities.',
        es: 'Devuelva su vaso oficial reutilizable de la Copa Mundial en cualquier quiosco de comida para recuperar su depósito o donarlo a causas ecológicas.',
        fr: 'Rapportez votre gobelet réutilisable officiel de la Coupe du Monde à n\'importe quel stand pour récupérer votre consigne ou faire un don écologique.',
        pt: 'Devolva seu copo reutilizável oficial da Copa do Mundo em qualquer quiosco de comida para resgatar seu depósito ou doar para instituições ecológicas.',
        ar: 'أعد كوب كأس العالم القابل لإعادة الاستخدام إلى أي كشك طعام (مثل تاكو الصديق للبيئة أو برجر المشوي الأخضر) لاسترداد مبلغ التأمين أو التبرع به للجمعيات البيئية.'
      }
    }
  ]
};

// Default gate and node crowd density setup
export const DEFAULT_DENSITY: Record<string, number> = {
  gate_a: 20,
  gate_b: 35,
  gate_c: 85, // Congested Gate (default)
  gate_d: 15,
  concourse_lower_west: 45,
  concourse_lower_east: 30,
  concourse_upper_west: 25,
  concourse_upper_east: 20,
  sec_101: 50,
  sec_102: 40,
  sec_110: 30,
  sec_111: 35,
  sec_201: 15,
  sec_202: 10,
  sec_210: 25,
  sec_211: 30,
  elevator_west: 70, // Busy elevator
  elevator_east: 20,
  stairs_west: 30,
  stairs_east: 15,
  restroom_std_east: 60,
  restroom_acc_west: 10,
  restroom_acc_east: 5,
  medical_west: 5,
  medical_east: 5,
  food_tacos_west: 80, // Busy taco stand
  food_burgers_east: 40,
  sensory_quiet_west: 5
};
