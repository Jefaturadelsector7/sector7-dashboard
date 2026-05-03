const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sector-7-primarias'
});

const db = admin.firestore();

const zonesData = [
  { id: 'zona18', name: 'Zona 18', supervisor: 'Prof. Oliverio Cante Ramírez', phone: '8682-076632' },
  { id: 'zona61', name: 'Zona 61', supervisor: 'Profra. Guadalupe Valenzuela Duarte', phone: '8681-637123' },
  { id: 'zona156', name: 'Zona 156', supervisor: 'Profra. Tatyana Velázquez Arellano', phone: '8681-240335' },
  { id: 'zona175', name: 'Zona 175', supervisor: 'Prof. Alejandro Cesar Rios Ochoa', phone: '8681-231723' },
  { id: 'zona189', name: 'Zona 189', supervisor: 'Prof. Rogelio Meza Campos', phone: '8681-235322' }
];

const schoolsData = [
  { name: 'Gral. Lauro Villar', zone: 'zona18', director: 'Sendibel Pérez Lara', students: 456, teachers: 15 },
  { name: 'Ignacio Ramírez', zone: 'zona18', director: 'Ana Lucia Lleverino Hernández', students: 320, teachers: 12 },
  { name: 'Plutarco Elías Calles', zone: 'zona18', director: 'Arturo Martín Meneces Cruz', students: 280, teachers: 10 },
  { name: 'Centro Educ. Oxford de Matamoros', zone: 'zona18', director: 'Efren Ochoa Mireles', students: 250, teachers: 9 },
  { name: 'Fidel Velázquez', zone: 'zona61', director: 'Cesar Augusto Hernández Arellano', students: 380, teachers: 13 },
  { name: 'Francisco I Madero', zone: 'zona61', director: 'Paloma Belém García González', students: 290, teachers: 11 },
  { name: 'Pte. Adolfo López Mateos', zone: 'zona61', director: 'Miguel Ángel Sánchez López', students: 310, teachers: 11 },
  { name: 'Colegio de la Salle', zone: 'zona61', director: 'Lic. Perla Tovar Soto', students: 420, teachers: 15 },
  { name: 'Colegio Bilingüe Villa Freinet', zone: 'zona61', director: 'Aida Enriqueta Hernández', students: 350, teachers: 13 },
  { name: 'Instituto Cima Anglointernacional', zone: 'zona61', director: 'Alejandra García Hurtado', students: 280, teachers: 10 },
  { name: 'Colegio Bilingüe Liceo Victoria', zone: 'zona61', director: 'Hector Joel Saucedo Segura', students: 270, teachers: 10 },
  { name: 'Colegio Bilingüe de las Américas', zone: 'zona61', director: 'Ana Paulova Martínez Medina', students: 310, teachers: 11 },
  { name: 'Colegio Bilingüe Oxford', zone: 'zona61', director: 'Frida Daniela Ramírez Infante', students: 290, teachers: 11 },
  { name: 'Colegio Casa de los Niños María Montessori', zone: 'zona61', director: 'Maria del Rosario Contreras Pérez', students: 200, teachers: 8 },
  { name: 'Cuauhtémoc', zone: 'zona156', director: 'Karla Deyanira Pérez Tovar', students: 380, teachers: 13 },
  { name: 'Francisco Nicodemo', zone: 'zona156', director: 'Pablo Gamez Galván', students: 320, teachers: 11 },
  { name: 'Emiliano Zapata', zone: 'zona156', director: 'Carlos Rene Martínez Hdz', students: 290, teachers: 10 },
  { name: 'Miguel Hidalgo', zone: 'zona156', director: 'Nehemías Arguijo López', students: 350, teachers: 12 },
  { name: 'Narciso Mendoza', zone: 'zona156', director: 'Esc. Sin Alumnos', students: 0, teachers: 0 },
  { name: 'Vicente Guerrero', zone: 'zona156', director: 'Armando Jiménez González', students: 270, teachers: 10 },
  { name: 'Juan Baez Guerra', zone: 'zona156', director: 'Gladys Irene Rosales Rangel', students: 340, teachers: 12 },
  { name: 'Ricardo Flores Magón', zone: 'zona156', director: 'Alfredo Duran Frausto', students: 300, teachers: 11 },
  { name: 'Club Rotario Mat. Sur', zone: 'zona156', director: 'Alejandro Zuñiga González', students: 250, teachers: 9 },
  { name: 'Club Rotario Mat. Sur (Vespertino)', zone: 'zona156', director: 'Roberto Abrego Pavón', students: 220, teachers: 8 },
  { name: 'Nueva Creación', zone: 'zona175', director: 'Luis Antonio Cervantes Muñoz', students: 310, teachers: 11 },
  { name: 'México', zone: 'zona175', director: 'Ignacio Leós Gómez', students: 290, teachers: 10 },
  { name: 'Juan Quiroga Arizpe', zone: 'zona175', director: 'Juan Francisco García Castañón', students: 280, teachers: 10 },
  { name: 'Edelwira Charles Salinas', zone: 'zona175', director: 'Rosalía Cavazos Salazar', students: 250, teachers: 9 },
  { name: 'Profr. Ignacio Quiroga Luna', zone: 'zona175', director: 'Alma Delia Cruz Cervantes', students: 240, teachers: 8 },
  { name: 'Arquímedes Caballero Caballero', zone: 'zona175', director: 'Herminio Montes Herrera', students: 200, teachers: 7 },
  { name: 'Justo Sierra', zone: 'zona189', director: 'José Leonor Hernández Nochebuena', students: 380, teachers: 13 },
  { name: 'Tamaulipas', zone: 'zona189', director: 'Jovita Salas Torres', students: 320, teachers: 11 },
  { name: 'Enrique C. Rebsamen', zone: 'zona189', director: 'Juan Martín Delgado Botello', students: 310, teachers: 11 },
  { name: 'Hermenegildo Galeana', zone: 'zona189', director: 'Rubén De la Cruz Hernández', students: 290, teachers: 10 },
  { name: 'Oralia Guerra de Villarreal', zone: 'zona189', director: 'Rogelio Meza Campos', students: 270, teachers: 10 },
  { name: 'Profr. Pedro Segura Flores', zone: 'zona189', director: 'Cynthia Alejandra Hernández Rodríguez', students: 250, teachers: 9 },
  { name: 'Pedro Hinojosa', zone: 'zona189', director: 'Eleazar Ortiz Alvarado', students: 220, teachers: 8 },
  { name: 'Profr. Rafael Betancourt Betancourt', zone: 'zona189', director: 'Miguel Antonio Nieto Rodríguez', students: 240, teachers: 8 },
  { name: 'Colegio Americano Nuevo Santander', zone: 'zona189', director: 'Yuriana Lizbeth Galván Vázquez', students: 350, teachers: 13 },
  { name: 'Colegio de Educación Angelopolitano', zone: 'zona189', director: 'Francisca Mireya Capetillo Mejía', students: 300, teachers: 11 },
  { name: 'Colegio Angelopolitano', zone: 'zona189', director: 'Alejandro Cruz Vázquez', students: 280, teachers: 10 }
];

async function loadData() {
  try {
    console.log('Cargando zonas...');
    for (const zone of zonesData) {
      await db.collection('zones').doc(zone.id).set(zone);
    }
    
    console.log('Cargando escuelas...');
    for (const school of schoolsData) {
      await db.collection('schools').add(school);
    }
    
    console.log('✅ Datos cargados exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

loadData();
