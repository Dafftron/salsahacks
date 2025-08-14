import { 
  Music, 
  Heart, 
  Zap, 
  Star, 
  Sun,
  GraduationCap,
  Calendar
} from 'lucide-react'

// Estructura jerárquica de categorías por pestaña y estilo
export const categoryStructure = {
  figuras: {
    name: 'FIGURAS',
    icon: Music,
    styles: {
      salsa: {
        name: 'SALSA',
        icon: Music,
        color: 'salsa',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'pink',
            tags: ['Salsa', 'Salsa en línea On1', 'Salsa cubana', 'Estilo LA', 'Estilo NY', 'Estilo show']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Pasitos libres', 'Parejas', 'Footwork On1', 'Footwork On2', 'Shines', 'Fusionado con afro', 'Body movement']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Cross Body Lead', 'Copa', 'Sombrero', 'Dile que no', 'Setenta', 'Vacilala', 'Enchufla', 'oculto']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos paralelas', 'Cruzadas', 'Entrelazadas', 'Cambio de manos', 'Manos abiertas', 'Sin contacto']
          }
        }
      },
      bachata: {
        name: 'BACHATA',
        icon: Heart,
        color: 'bachata',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'red',
            tags: ['Bachata dominicana', 'Bachata moderna', 'Bachata sensual', 'Bachata urbana']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body rolls', 'Hip movement', 'Footwork básico', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Dile que no', 'Setenta', 'Vacilala', 'Sombrero', 'Copa', 'oculto']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Entrelazadas']
          }
        }
      },
      kizomba: {
        name: 'KIZOMBA',
        icon: Zap,
        color: 'kizomba',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'yellow',
            tags: ['Kizomba tradicional', 'Kizomba urbana', 'Tarraxinha', 'Semba']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body movement', 'Hip rolls', 'Footwork', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Saída', 'Volta', 'Tarraxinha', 'Semba step', 'oculto']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Sin contacto']
          }
        }
      },
      zouk: {
        name: 'ZOUK',
        icon: Star,
        color: 'zouk',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'purple',
            tags: ['Zouk brasileño', 'Zouk flow', 'Zouk neofusion', 'Zouk tradicional']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body rolls', 'Head movement', 'Footwork', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Lateral', 'Tranca', 'Pião', 'Balanço', 'oculto']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Entrelazadas']
          }
        }
      },
      merengue: {
        name: 'MERENGUE',
        icon: Sun,
        color: 'merengue',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'orange',
            tags: ['Merengue dominicano', 'Merengue tradicional', 'Merengue moderno']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Hip movement', 'Footwork básico', 'Turns simples']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Giros simples', 'Cambios de dirección', 'Pasos básicos', 'oculto']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Sin contacto']
          }
        }
      }
    }
  },
  musica: {
    name: 'MÚSICA',
    icon: Music,
    styles: {
      salsa: {
        name: 'SALSA',
        icon: Music,
        color: 'salsa',
        categories: {
          subestilo: {
            name: 'SUBESTILO/SUBGÉNERO',
            color: 'orange',
            tags: ['Clásico', 'Romántica', 'Timba', 'Descarga', 'Mambo', 'Dura / NY style', 'Caleña', 'Puertorriqueña', 'Cubana', 'Moderna / Fusión']
          },
          influencia: {
            name: 'INFLUENCIA',
            color: 'purple',
            tags: ['Son cubano', 'Rumba', 'Afro', 'Jazz', 'Pop', 'Flamenco', 'Urbana']
          },
          instrumentos: {
            name: 'INSTRUMENTOS',
            color: 'blue',
            tags: ['Bajo', 'Piano', 'Conga', 'Timbal', 'Metales', 'Clave', 'Güiro']
          },
          tipo: {
            name: 'TIPO',
            color: 'green',
            tags: ['Original', 'Remix', 'Instrumental', 'En vivo', 'Acústico']
          },
          energia: {
            name: 'ENERGÍA',
            color: 'red',
            tags: ['Suave', 'Media', 'Alta']
          },
          bpm: {
            name: 'BPM/RITMO',
            color: 'blue',
            tags: ['80-95', '96-110', '111-125', '126-140']
          }
        }
      },
      rumba: {
        name: 'RUMBA',
        icon: Star,
        color: 'rumba',
        categories: {
          subestilo: {
            name: 'SUBGÉNERO',
            color: 'orange',
            tags: ['Guaguancó', 'Yambú', 'Columbia', 'Rumba moderna / experimental']
          },
          influencia: {
            name: 'INFLUENCIA',
            color: 'purple',
            tags: ['Afro', 'Yoruba / Batá', 'Percusión corporal', 'Voz / canto ritual']
          },
          instrumentos: {
            name: 'INSTRUMENTOS',
            color: 'blue',
            tags: ['Cajones', 'Clave de rumba', 'Batá', 'Quinto', 'Tumbadora']
          }
        }
      },
      afro: {
        name: 'AFRO-CUBANO/AFRO',
        icon: Zap,
        color: 'afro',
        categories: {
          subestilo: {
            name: 'SUBGÉNERO',
            color: 'orange',
            tags: ['Yoruba (religioso)', 'Arará', 'Abakuá', 'Franco-haitiano', 'Makuta', 'Conga (ritual, no desfile)']
          },
          instrumentos: {
            name: 'INSTRUMENTOS',
            color: 'blue',
            tags: ['Batá', 'Chekeré', 'Campana', 'Voz ritual', 'Tambores barriles']
          }
        }
      },
      bachata: {
        name: 'BACHATA',
        icon: Heart,
        color: 'bachata',
        categories: {
          subestilo: {
            name: 'SUBESTILO/SUBGÉNERO',
            color: 'orange',
            tags: ['Tradicional', 'Moderna', 'Sensual', 'Urbana']
          },
          tipo: {
            name: 'TIPO',
            color: 'green',
            tags: ['Original', 'Remix', 'Instrumental', 'En vivo']
          },
          energia: {
            name: 'ENERGÍA',
            color: 'red',
            tags: ['Suave', 'Media', 'Alta']
          },
          bpm: {
            name: 'BPM/RITMO',
            color: 'blue',
            tags: ['70-85', '86-100', '101-115', '116-130']
          }
        }
      },
      kizomba: {
        name: 'KIZOMBA',
        icon: Zap,
        color: 'kizomba',
        categories: {
          subestilo: {
            name: 'SUBESTILO/SUBGÉNERO',
            color: 'orange',
            tags: ['Tradicional', 'Urban Kiz', 'Ghetto Zouk', 'Tarraxinha']
          },
          tipo: {
            name: 'TIPO',
            color: 'green',
            tags: ['Original', 'Remix', 'Instrumental', 'En vivo']
          },
          energia: {
            name: 'ENERGÍA',
            color: 'red',
            tags: ['Suave', 'Media', 'Alta']
          },
          bpm: {
            name: 'BPM/RITMO',
            color: 'blue',
            tags: ['70-85', '86-95', '96-105']
          }
        }
      },
      zouk: {
        name: 'ZOUK',
        icon: Star,
        color: 'zouk',
        categories: {
          subestilo: {
            name: 'SUBESTILO/SUBGÉNERO',
            color: 'orange',
            tags: ['Brazilian', 'Lambazouk', 'Flow', 'Neo']
          },
          tipo: {
            name: 'TIPO',
            color: 'green',
            tags: ['Original', 'Remix', 'Instrumental', 'En vivo']
          },
          energia: {
            name: 'ENERGÍA',
            color: 'red',
            tags: ['Suave', 'Media', 'Alta']
          },
          bpm: {
            name: 'BPM/RITMO',
            color: 'blue',
            tags: ['80-95', '96-110', '111-125']
          }
        }
      },
      merengue: {
        name: 'MERENGUE',
        icon: Sun,
        color: 'merengue',
        categories: {
          subestilo: {
            name: 'SUBESTILO/SUBGÉNERO',
            color: 'orange',
            tags: ['Tradicional', 'Moderno']
          },
          tipo: {
            name: 'TIPO',
            color: 'green',
            tags: ['Original', 'Remix', 'Instrumental', 'En vivo']
          },
          energia: {
            name: 'ENERGÍA',
            color: 'red',
            tags: ['Suave', 'Media', 'Alta']
          },
          bpm: {
            name: 'BPM/RITMO',
            color: 'blue',
            tags: ['110-125', '126-140', '141-160']
          }
        }
      }
    }
  },
  escuela: {
    name: 'ESCUELA',
    icon: GraduationCap,
    styles: {
      salsa: {
        name: 'SALSA',
        icon: Music,
        color: 'escuela-salsa',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'pink',
            tags: ['Salsa', 'Mambo', 'Coreografía']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'yellow',
            tags: ['Talipo', 'Pepe y Marta', 'Dabbicco y Ani', 'Alberto y Ani', 'Fran y Meel', 'Aitor y Nuria', 'Pepe y Ani']
          }
        }
      },
      'pasitos-libres': {
        name: 'PASITOS LIBRES',
        icon: Star,
        color: 'escuela-pasitos-libres',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'yellow',
            tags: ['Salsa', 'Mambo', 'Rumba', 'Coreografía', 'Afro', 'Boogaloo', 'ChaCha', 'Pachanga']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Pocho', 'Dabbicco', 'Talia', 'Pepe y Ani']
          }
        }
      },
      'salsa-cubana': {
        name: 'SALSA CUBANA',
        icon: Music,
        color: 'escuela-salsa-cubana',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'red',
            tags: ['Salsa cubana']
          },
          nivel: {
            name: 'NIVEL',
            color: 'yellow',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Talipo', 'Ñete y Ani', 'Ñete y Maite', 'Dabbicco y Ani', 'Pepe y Ani']
          }
        }
      },
      merengue: {
        name: 'MERENGUE',
        icon: Sun,
        color: 'escuela-merengue',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'yellow',
            tags: ['Merengue', 'Bachata-Merengue', 'Coreografía']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Talipo', 'Pepe y Marta', 'Dabbicco y Ani', 'Alberto y Ani', 'Fran y Meel', 'Aitor y Nuria', 'Pepe y Ani', 'Miguel y Sunsire']
          }
        }
      },
      bachata: {
        name: 'BACHATA',
        icon: Heart,
        color: 'escuela-bachata',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'red',
            tags: ['Bachata', 'Bachata tradicional', 'Bolero', 'Bachata Zouk', 'Bachata sensual']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Pepe y Marta', 'Alberto y Ani', 'Aitor y Nuria', 'Pepe y Ani', 'El Andres e Isa', 'Andress y Yessica', 'Ani', 'Luis Enrique y Alma', 'Alma', 'Tamara y Candido']
          }
        }
      },
      kizomba: {
        name: 'KIZOMBA',
        icon: Star,
        color: 'escuela-kizomba',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'amber',
            tags: ['Kizomba', 'Urban Kiz', 'Tarraxinha', 'Coreografía']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo', 'oculto']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Talipo', 'Pepe y Marta', 'Dabbicco y Ani', 'Alberto y Ani', 'Fran y Meel', 'Aitor y Nuria', 'Pepe y Ani']
          }
        }
      },
      zouk: {
        name: 'ZOUK',
        icon: Zap,
        color: 'escuela-zouk',
        categories: {
          curso: {
            name: 'CURSO',
            color: 'blue',
            tags: ['Año 18-19', 'Año 19-20', 'Año 20-21', 'Año 21-22', 'Año 22-23', 'Año 23-24', 'Año 24-25', 'Año 25-26', 'Año 26-27', 'Año 27-28', 'Año 28-29']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          },
          hora: {
            name: 'HORA',
            color: 'purple',
            tags: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
          },
          estilo: {
            name: 'ESTILO',
            color: 'violet',
            tags: ['Brazilian Zouk', 'Lambazouk', 'Zouk Flow', 'Coreografía']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio', 'Intermedio I', 'Intermedio II', 'Intermedio III', 'Avanzado']
          },
          tipo: {
            name: 'TIPO',
            color: 'indigo',
            tags: ['Intensivo']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'pink',
            tags: ['Talipo', 'Pepe y Marta', 'Dabbicco y Ani', 'Alberto y Ani', 'Fran y Meel', 'Aitor y Nuria', 'Pepe y Ani']
          }
        }
      }
    }
  },
  eventos: {
    name: 'EVENTOS',
    icon: Calendar,
    styles: {
      talleres: {
        name: 'TALLERES',
        icon: Calendar,
        color: 'eventos-talleres',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'pink',
            tags: ['Salsa', 'Bachata']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'yellow',
            tags: ['Talipo', 'Tamara y Candido', 'Luis y Alma']
          }
        }
  },
      congresos: {
        name: 'CONGRESOS',
        icon: Calendar,
        color: 'eventos-congresos',
        categories: {
          anio: {
            name: 'AÑO',
            color: 'blue',
            tags: ['2020','2021','2022','2023','2024','2025','2026','2027','2028','2029','2030']
          },
          mes: {
            name: 'MES',
            color: 'green',
            tags: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
          },
          dia: {
            name: 'DÍA',
            color: 'orange',
            tags: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']
          },
          nombre: {
            name: 'NOMBRE',
            color: 'purple',
            tags: ['SDX','Salsander','Burgos','Atenas','Budapest']
          },
          estilo: {
            name: 'ESTILO',
            color: 'pink',
            tags: ['Salsa','Bachata','Pasitos','Salsa cubana','Mambo']
          },
          nivel: {
            name: 'NIVEL',
            color: 'red',
            tags: ['Inicio','Intermedio I','Intermedio II','Intermedio III','Avanzado']
          },
          profesores: {
            name: 'PROFESORES',
            color: 'yellow',
            tags: ['Talipo','Panagiotis y Myrto']
          }
        }
      }
    }
  }
}
