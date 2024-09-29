#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
from random import randint, choice
from faker import Faker

fake = Faker('es_ES')

num_comunidades = 50
num_usuarios = 500
num_administradores = 20
num_miembros = 480
num_contratos = 100
num_votaciones = 200
num_opciones = 500
num_actas = 100
num_registros = 10000
num_cadenas_de_bloques = 10

def rand_timestamp():
    "Genera una marca de tiempo UNIX aleatoria."
    return fake.unix_time()

def create_comunidades(cur):
    print("%d comunidades serán insertadas." % num_comunidades)
    cur.execute("DROP TABLE IF EXISTS Comunidad CASCADE")
    cur.execute("""CREATE TABLE Comunidad(
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fechaDeCreacion DATE,
        idCadenaDeBloques INTEGER REFERENCES CadenaDeBloques(id)
    )""")

    for _ in range(num_comunidades):
        nombre = fake.company()
        descripcion = fake.catch_phrase()
        fecha_creacion = fake.date_this_decade()
        cur.execute("INSERT INTO Comunidad (nombre, descripcion, fechaDeCreacion) VALUES (%s, %s, %s)", (nombre, descripcion, fecha_creacion))
    conn.commit()

def create_usuarios(cur):
    print("%d usuarios serán insertados." % num_usuarios)
    cur.execute("DROP TABLE IF EXISTS Usuario CASCADE")
    cur.execute("""CREATE TABLE Usuario(
        nombre VARCHAR(100) PRIMARY KEY,
        fechaDeNacimiento DATE,
        correo VARCHAR(100),
        telefono VARCHAR(20),
        contrasena VARCHAR(100)
    )""")

    for _ in range(num_usuarios):
        nombre = fake.user_name()
        fecha_nacimiento = fake.date_of_birth()
        correo = fake.email()
        telefono = fake.phone_number()
        contrasena = fake.password()
        cur.execute("INSERT INTO Usuario VALUES (%s, %s, %s, %s, %s)", (nombre, fecha_nacimiento, correo, telefono, contrasena))
    conn.commit()

def create_administradores(cur):
    print("%d administradores serán insertados." % num_administradores)
    cur.execute("DROP TABLE IF EXISTS Administrador CASCADE")
    cur.execute("""CREATE TABLE Administrador(
        nombre VARCHAR(100) PRIMARY KEY REFERENCES Usuario(nombre),
        idComunidad INTEGER REFERENCES Comunidad(id)
    )""")

    for _ in range(num_administradores):
        cur.execute("SELECT nombre FROM Usuario ORDER BY RANDOM() LIMIT 1")
        nombre_usuario = cur.fetchone()[0]
        cur.execute("SELECT id FROM Comunidad ORDER BY RANDOM() LIMIT 1")
        id_comunidad = cur.fetchone()[0]
        cur.execute("INSERT INTO Administrador VALUES (%s, %s)", (nombre_usuario, id_comunidad))
    conn.commit()

def create_miembros(cur):
    print("%d miembros serán insertados." % num_miembros)
    cur.execute("DROP TABLE IF EXISTS Miembro CASCADE")
    cur.execute("""CREATE TABLE Miembro(
        nombre VARCHAR(100) PRIMARY KEY REFERENCES Usuario(nombre),
        Participacion FLOAT
    )""")

    for _ in range(num_miembros):
        nombre = fake.user_name()
        participacion = randint(0, 100)
        cur.execute("INSERT INTO Miembro VALUES (%s, %s)", (nombre, participacion))
    conn.commit()

def create_contratos(cur):
    print("%d contratos serán insertados." % num_contratos)
    cur.execute("DROP TABLE IF EXISTS ContratoInteligente CASCADE")
    cur.execute("""CREATE TABLE ContratoInteligente(
        id SERIAL PRIMARY KEY,
        votosPorUsuario INTEGER,
        resultado BOOLEAN,
        tiempoDeVotacion INTEGER,
        codigoActa INTEGER REFERENCES Acta(codigo)
    )""")
    
    for _ in range(num_contratos):
        votos_por_usuario = randint(1, 10)
        resultado = choice([True, False])
        tiempo_de_votacion = randint(3600, 259200)  # Duración aleatoria entre 1 hora y 3 días en segundos
        cur.execute("INSERT INTO ContratoInteligente (votosPorUsuario, resultado, tiempoDeVotacion) VALUES (%s, %s, %s)", (votos_por_usuario, resultado, tiempo_de_votacion))
    conn.commit()

def create_votaciones(cur):
    print("%d votaciones serán insertadas." % num_votaciones)
    cur.execute("DROP TABLE IF EXISTS Votacion CASCADE")
    cur.execute("""CREATE TABLE Votacion(
        id SERIAL PRIMARY KEY,
        descripcion TEXT,
        proposito TEXT,
        idContrato INTEGER REFERENCES ContratoInteligente(id),
        nombreAdministrador VARCHAR(100) REFERENCES Administrador(nombre)
    )""")

    for _ in range(num_votaciones):
        descripcion = fake.text(max_nb_chars=200)
        proposito = fake.text(max_nb_chars=200)
        cur.execute("SELECT id FROM ContratoInteligente ORDER BY RANDOM() LIMIT 1")
        id_contrato = cur.fetchone()[0]
        cur.execute("SELECT nombre FROM Administrador ORDER BY RANDOM() LIMIT 1")
        nombre_administrador = cur.fetchone()[0]
        cur.execute("INSERT INTO Votacion (descripcion, proposito, idContrato, nombreAdministrador) VALUES (%s, %s, %s, %s)", (descripcion, proposito, id_contrato, nombre_administrador))
    conn.commit()

def create_opciones(cur):
    print("%d opciones serán insertadas." % num_opciones)
    cur.execute("DROP TABLE IF EXISTS Opcion CASCADE")
    cur.execute("""CREATE TABLE Opcion(
        nombre VARCHAR(100) PRIMARY KEY,
        descripcion TEXT,
        idVotacion INTEGER REFERENCES Votacion(id)
    )""")

    for _ in range(num_opciones):
        nombre = fake.word()
        descripcion = fake.text(max_nb_chars=200)
        cur.execute("SELECT id FROM Votacion ORDER BY RANDOM() LIMIT 1")
        id_votacion = cur.fetchone()[0]
        cur.execute("INSERT INTO Opcion (nombre, descripcion, idVotacion) VALUES (%s, %s, %s)", (nombre, descripcion, id_votacion))
    conn.commit()

def create_actas(cur):
    print("%d actas serán insertadas." % num_actas)
    cur.execute("DROP TABLE IF EXISTS Acta CASCADE")
    cur.execute("""CREATE TABLE Acta(
        codigo SERIAL PRIMARY KEY,
        fecha DATE,
        titulo VARCHAR(200),
        descripcion TEXT,
        PuntosImportantes TEXT,
        nombreAdministrador VARCHAR(100) REFERENCES Administrador(nombre)
    )""")

    for _ in range(num_actas):
        fecha = fake.date_this_decade()
        titulo = fake.sentence(nb_words=6, variable_nb_words=True, ext_word_list=None)
        descripcion = fake.text(max_nb_chars=200)
        puntos_importantes = fake.text(max_nb_chars=200)
        cur.execute("SELECT nombre FROM Administrador ORDER BY RANDOM() LIMIT 1")
        nombre_administrador = cur.fetchone()[0]
        cur.execute("INSERT INTO Acta (fecha, titulo, descripcion, PuntosImportantes, nombreAdministrador) VALUES (%s, %s, %s, %s, %s)", (fecha, titulo, descripcion, puntos_importantes, nombre_administrador))
    conn.commit()

def create_registros(cur):
    print("%d registros serán insertados." % num_registros)
    cur.execute("DROP TABLE IF EXISTS Registro CASCADE")
    cur.execute("""CREATE TABLE Registro(
        codigo SERIAL PRIMARY KEY,
        marcaDeTiempo INTEGER,
        idCadenaDeBloques INTEGER REFERENCES CadenaDeBloques(id)
    )""")

    for _ in range(num_registros):
        marca_de_tiempo = rand_timestamp()
        cur.execute("INSERT INTO Registro (marcaDeTiempo) VALUES (%s)", (marca_de_tiempo,))
    conn.commit()

def create_cadenas_de_bloques(cur):
    print("%d cadenas de bloques serán insertadas." % num_cadenas_de_bloques)
    cur.execute("DROP TABLE IF EXISTS CadenaDeBloques CASCADE")
    cur.execute("""CREATE TABLE CadenaDeBloques(
        id SERIAL PRIMARY KEY,
        numRegistros INTEGER
    )""")

    for _ in range(num_cadenas_de_bloques):
        num_registros = randint(1000, 10000)
        cur.execute("INSERT INTO CadenaDeBloques (numRegistros) VALUES (%s)", (num_registros,))
    conn.commit()

def create_pertenece(cur):
    print("Creando la tabla Pertenece...")
    cur.execute("DROP TABLE IF EXISTS Pertenece CASCADE")
    cur.execute("""CREATE TABLE Pertenece(
        idComunidad INTEGER REFERENCES Comunidad(id),
        nombreUsuario VARCHAR(100) REFERENCES Usuario(nombre),
        PRIMARY KEY (idComunidad, nombreUsuario)
    )""")

    for _ in range(num_miembros):
        cur.execute("SELECT id FROM Comunidad ORDER BY RANDOM() LIMIT 1")
        id_comunidad = cur.fetchone()[0]
        cur.execute("SELECT nombre FROM Usuario ORDER BY RANDOM() LIMIT 1")
        nombre_usuario = cur.fetchone()[0]
        cur.execute("INSERT INTO Pertenece (idComunidad, nombreUsuario) VALUES (%s, %s)", (id_comunidad, nombre_usuario))
    conn.commit()

def create_permite(cur):
    print("Creando la tabla Permite...")
    cur.execute("DROP TABLE IF EXISTS Permite CASCADE")
    cur.execute("""CREATE TABLE Permite(
        idContrato INTEGER REFERENCES ContratoInteligente(id),
        nombreMiembro VARCHAR(100) REFERENCES Miembro(nombre),
        PRIMARY KEY (idContrato, nombreMiembro)
    )""")

    for _ in range(num_contratos):
        cur.execute("SELECT id FROM ContratoInteligente ORDER BY RANDOM() LIMIT 1")
        id_contrato = cur.fetchone()[0]
        cur.execute("SELECT nombre FROM Miembro ORDER BY RANDOM() LIMIT 1")
        nombre_miembro = cur.fetchone()[0]
        cur.execute("INSERT INTO Permite (idContrato, nombreMiembro) VALUES (%s, %s)", (id_contrato, nombre_miembro))
    conn.commit()

def create_regla(cur):
    print("Creando la tabla Regla...")
    cur.execute("DROP TABLE IF EXISTS Regla CASCADE")
    cur.execute("""CREATE TABLE Regla(
        nombre VARCHAR(100) PRIMARY KEY,
        descripcion TEXT,
        idContrato INTEGER REFERENCES ContratoInteligente(id)
    )""")

    for _ in range(num_contratos):
        nombre = fake.word()
        descripcion = fake.text(max_nb_chars=200)
        cur.execute("SELECT id FROM ContratoInteligente ORDER BY RANDOM() LIMIT 1")
        id_contrato = cur.fetchone()[0]
        cur.execute("INSERT INTO Regla (nombre, descripcion, idContrato) VALUES (%s, %s, %s)", (nombre, descripcion, id_contrato))
    conn.commit()

def create_opcion_votada(cur):
    print("Creando la tabla OpcionVotada...")
    cur.execute("DROP TABLE IF EXISTS OpcionVotada CASCADE")
    cur.execute("""CREATE TABLE OpcionVotada(
        idVotacion INTEGER REFERENCES Votacion(id),
        nombreMiembro VARCHAR(100) REFERENCES Miembro(nombre),
        Codigo INTEGER REFERENCES Registro(codigo),
        PRIMARY KEY (idVotacion, nombreMiembro)
    )""")

    for _ in range(num_votaciones):
        cur.execute("SELECT id FROM Votacion ORDER BY RANDOM() LIMIT 1")
        id_votacion = cur.fetchone()[0]
        cur.execute("SELECT nombre FROM Miembro ORDER BY RANDOM() LIMIT 1")
        nombre_miembro = cur.fetchone()[0]
        cur.execute("SELECT codigo FROM Registro ORDER BY RANDOM() LIMIT 1")
        codigo_registro = cur.fetchone()[0]
        cur.execute("INSERT INTO OpcionVotada (idVotacion, nombreMiembro, Codigo) VALUES (%s, %s, %s)", (id_votacion, nombre_miembro, codigo_registro))
    conn.commit()

# Programa principal
conn = psycopg2.connect(
    host="your_host",
    user="your_user",
    password="your_password",
    database="your_database"
)
cur = conn.cursor()

create_comunidades(cur)
create_usuarios(cur)
create_administradores(cur)
create_miembros(cur)
create_contratos(cur)
create_votaciones(cur)
create_opciones(cur)
create_actas(cur)
create_registros(cur)
create_cadenas_de_bloques(cur)
create_pertenece(cur)
create_permite(cur)
create_regla(cur)
create_opcion_votada(cur)

cur.close()
