import firebase_admin
from firebase_admin import credentials, firestore
import json

# Inicializar Firebase (usar credenciales de service account)
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Datos de Sector 7
zones_data = [
    {'id': 'zona18', 'name': 'Zona 18', 'supervisor': 'Prof. Oliverio Cante Ramírez', 'phone': '8682-076632'},
    {'id': 'zona61', 'name': 'Zona 61', 'supervisor': 'Profra. Guadalupe Valenzuela Duarte', 'phone': '8681-637123'},
    {'id': 'zona156', 'name': 'Zona 156', 'supervisor': 'Profra. Tatyana Velázquez Arellano', 'phone': '8681-240335'},
    {'id': 'zona175', 'name': 'Zona 175', 'supervisor': 'Prof. Alejandro Cesar Rios Ochoa', 'phone': '8681-231723'},
    {'id': 'zona189', 'name': 'Zona 189', 'supervisor': 'Prof. Rogelio Meza Campos', 'phone': '8681-235322'},
]

schools_data = [
    # Zona 18
    {'name': 'Gral. Lauro Villar', 'zone': 'zona18', 'director': 'Sendibel Pérez Lara', 'students': 456, 'teachers': 15, 'cct': '28DPR080E'},
    {'name': 'Ignacio Ramírez', 'zone': 'zona18', 'director': 'Ana Lucia Lleverino Hernández', 'students': 320, 'teachers': 12, 'cct': '28DPR763H'},
    {'name': 'Plutarco Elías Calles', 'zone': 'zona18', 'director': 'Arturo Martín Meneces Cruz', 'students': 280, 'teachers': 10, 'cct': '28DPR200SL'},
    {'name': 'Centro Educ. Oxford de Matamoros', 'zone': 'zona18', 'director': 'Efren Ochoa Mireles', 'students': 250, 'teachers': 9, 'cct': '28PPR0233V'},
    # Zona 61
    {'name': 'Fidel Velázquez', 'zone': 'zona61', 'director': 'Cesar Augusto Hernández Arellano', 'students': 380, 'teachers': 13, 'cct': '28DPR0457Z'},
    {'name': 'Francisco I Madero', 'zone': 'zona61', 'director': 'Paloma Belém García González', 'students': 290, 'teachers': 11, 'cct': '28DPR0458Z'},
    {'name': 'Pte. Adolfo López Mateos', 'zone': 'zona61', 'director': 'Miguel Ángel Sánchez López', 'students': 310, 'teachers': 11, 'cct': '28DPR1715E'},
    {'name': 'Colegio de la Salle', 'zone': 'zona61', 'director': 'Lic. Perla Tovar Soto', 'students': 420, 'teachers': 15, 'cct': '28PPR0005C'},
    {'name': 'Colegio Bilingüe Villa Freinet', 'zone': 'zona61', 'director': 'Aida Enriqueta Hernández', 'students': 350, 'teachers': 13, 'cct': '28PPR0112L'},
    {'name': 'Instituto Cima Anglointernacional', 'zone': 'zona61', 'director': 'Alejandra García Hurtado', 'students': 280, 'teachers': 10, 'cct': '28PPR0206Z'},
    {'name': 'Colegio Bilingüe Liceo Victoria', 'zone': 'zona61', 'director': 'Hector Joel Saucedo Segura', 'students': 270, 'teachers': 10, 'cct': '28PPR0398F'},
    {'name': 'Colegio Bilingüe de las Américas', 'zone': 'zona61', 'director': 'Ana Paulova Martínez Medina', 'students': 310, 'teachers': 11, 'cct': '28DPR0425M'},
    {'name': 'Colegio Bilingüe Oxford', 'zone': 'zona61', 'director': 'Frida Daniela Ramírez Infante', 'students': 290, 'teachers': 11, 'cct': '28PPR0234W'},
    {'name': 'Colegio Casa de los Niños María Montessori', 'zone': 'zona61', 'director': 'Maria del Rosario Contreras Pérez', 'students': 200, 'teachers': 8, 'cct': '28PPR0451K'},
    # Zona 156
    {'name': 'Cuauhtémoc', 'zone': 'zona156', 'director': 'Karla Deyanira Pérez Tovar', 'students': 380, 'teachers': 13, 'cct': '28DPR0603U'},
    {'name': 'Francisco Nicodemo', 'zone': 'zona156', 'director': 'Pablo Gamez Galván', 'students': 320, 'teachers': 11, 'cct': '28DPR0690'},
    {'name': 'Emiliano Zapata', 'zone': 'zona156', 'director': 'Carlos Rene Martínez Hdz', 'students': 290, 'teachers': 10, 'cct': '28DPR06100'},
    {'name': 'Cuauhtémoc', 'zone': 'zona156', 'director': 'Nehemías Arguijo López', 'students': 350, 'teachers': 12, 'cct': '28DPR0632P'},
    {'name': 'Miguel Hidalgo', 'zone': 'zona156', 'director': 'Alejandro Pérez Banda', 'students': 310, 'teachers': 11, 'cct': '28DPR1280J'},
    {'name': 'Narciso Mendoza', 'zone': 'zona156', 'director': 'Esc. Sin Alumnos', 'students': 0, 'teachers': 0, 'cct': '28DPR1282H'},
    {'name': 'Vicente Guerrero', 'zone': 'zona156', 'director': 'Armando Jiménez González', 'students': 270, 'teachers': 10, 'cct': '28DPR1888W'},
    {'name': 'Juan Baez Guerra', 'zone': 'zona156', 'director': 'Gladys Irene Rosales Rangel', 'students': 340, 'teachers': 12, 'cct': '28DPR1888V'},
    {'name': 'Ricardo Flores Magón', 'zone': 'zona156', 'director': 'Alfredo Duran Frausto', 'students': 300, 'teachers': 11, 'cct': '28DPR2147J'},
    {'name': 'Club Rotario Mat. Sur', 'zone': 'zona156', 'director': 'Alejandro Zuñiga González', 'students': 250, 'teachers': 9, 'cct': '28DPR2289H'},
    {'name': 'Club Rotario Mat. Sur', 'zone': 'zona156', 'director': 'Roberto Abrego Pavón', 'students': 220, 'teachers': 8, 'cct': '28DPR2332F'},
    # Zona 175
    {'name': 'Nueva Creación', 'zone': 'zona175', 'director': 'Luis Antonio Cervantes Muñoz', 'students': 310, 'teachers': 11, 'cct': '28DPR0108U'},
    {'name': 'México', 'zone': 'zona175', 'director': 'Ignacio Leós Gómez', 'students': 290, 'teachers': 10, 'cct': '28DPR1886V'},
    {'name': 'Juan Quiroga Arizpe', 'zone': 'zona175', 'director': 'Juan Francisco García Castañón', 'students': 280, 'teachers': 10, 'cct': '28DPR2157D'},
    {'name': 'Edelwira Charles Salinas', 'zone': 'zona175', 'director': 'Rosalía Cavazos Salazar', 'students': 250, 'teachers': 9, 'cct': '28DPR2176E'},
    {'name': 'Profr. Ignacio Quiroga Luna', 'zone': 'zona175', 'director': 'Alma Delia Cruz Cervantes', 'students': 240, 'teachers': 8, 'cct': '28DPR2387I'},
    {'name': 'Arquímedes Caballero Caballero', 'zone': 'zona175', 'director': 'Herminio Montes Herrera', 'students': 200, 'teachers': 7, 'cct': '28DPR2493S'},
    # Zona 189
    {'name': 'Justo Sierra', 'zone': 'zona189', 'director': 'José Leonor Hernández Nochebuena', 'students': 380, 'teachers': 13, 'cct': '28DPR0606R'},
    {'name': 'Tamaulipas', 'zone': 'zona189', 'director': 'Jovita Salas Torres', 'students': 320, 'teachers': 11, 'cct': '28DPR0636L'},
    {'name': 'Enrique C. Rebsamen', 'zone': 'zona189', 'director': 'Juan Martín Delgado Botello', 'students': 310, 'teachers': 11, 'cct': '28DPR2108H'},
    {'name': 'Hermenegildo Galeana', 'zone': 'zona189', 'director': 'Rubén De la Cruz Hernández', 'students': 290, 'teachers': 10, 'cct': '28DPR2168W'},
    {'name': 'Oralia Guerra de Villarreal', 'zone': 'zona189', 'director': 'Rogelio Meza Campos', 'students': 270, 'teachers': 10, 'cct': '28DPR2173H'},
    {'name': 'Profr. Pedro Segura Flores', 'zone': 'zona189', 'director': 'Cynthia Alejandra Hernández Rodríguez', 'students': 250, 'teachers': 9, 'cct': '28DPR2225X'},
    {'name': 'Pedro Hinojosa', 'zone': 'zona189', 'director': 'Eleazar Ortiz Alvarado', 'students': 220, 'teachers': 8, 'cct': '28DPR2277C'},
    {'name': 'Profr. Rafael Betancourt Betancourt', 'zone': 'zona189', 'director': 'Miguel Antonio Nieto Rodríguez', 'students': 240, 'teachers': 8, 'cct': '28DPR2323Y'},
    {'name': 'Colegio Americano Nuevo Santander', 'zone': 'zona189', 'director': 'Yuriana Lizbeth Galván Vázquez', 'students': 350, 'teachers': 13, 'cct': '28PPR0263R'},
    {'name': 'Colegio de Educación Angelopolitano', 'zone': 'zona189', 'director': 'Francisca Mireya Capetillo Mejía', 'students': 300, 'teachers': 11, 'cct': '28PPR0308X'},
    {'name': 'Colegio Angelopolitano', 'zone': 'zona189', 'director': 'Alejandro Cruz Vázquez', 'students': 280, 'teachers': 10, 'cct': '28PPR0452J'},
]

# Crear usuario de prueba
try:
    # Agregar zonas
    for zone in zones_data:
        db.collection('zones').document(zone['id']).set(zone)
    
    # Agregar escuelas
    for school in schools_data:
        db.collection('schools').add(school)
    
    print("Datos cargados exitosamente en Firebase")
except Exception as e:
    print(f"Error: {e}")
