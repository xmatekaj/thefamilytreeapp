// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Person {
    id: String,
    #[serde(rename = "firstName")]
    first_name: String,
    #[serde(rename = "lastName")]
    last_name: String,
    #[serde(rename = "birthDate")]
    birth_date: Option<String>,
    #[serde(rename = "deathDate")]
    death_date: Option<String>,
    photo: Option<String>,
    generation: i32,
    #[serde(rename = "positionX")]
    position_x: Option<f64>,
    #[serde(rename = "positionY")]
    position_y: Option<f64>,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Relationship {
    id: String,
    #[serde(rename = "fromPersonId")]
    from_person_id: String,
    #[serde(rename = "toPersonId")]
    to_person_id: String,
    #[serde(rename = "type")]
    rel_type: String,
    #[serde(rename = "spouseType")]
    spouse_type: Option<String>,
    #[serde(rename = "marriageNumber")]
    marriage_number: Option<i32>,
    #[serde(rename = "startDate")]
    start_date: Option<String>,
    #[serde(rename = "endDate")]
    end_date: Option<String>,
    color: String,
    #[serde(rename = "createdAt")]
    created_at: String,
    #[serde(rename = "updatedAt")]
    updated_at: String,
}

struct DbState {
    conn: Mutex<Connection>,
}

#[tauri::command]
fn init_database(state: State<DbState>) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS persons (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            birth_date TEXT,
            death_date TEXT,
            photo TEXT,
            generation INTEGER NOT NULL DEFAULT 0,
            position_x REAL,
            position_y REAL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    ).map_err(|e| e.to_string())?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS relationships (
            id TEXT PRIMARY KEY,
            from_person_id TEXT NOT NULL,
            to_person_id TEXT NOT NULL,
            rel_type TEXT NOT NULL,
            spouse_type TEXT,
            marriage_number INTEGER,
            start_date TEXT,
            end_date TEXT,
            color TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(from_person_id) REFERENCES persons(id),
            FOREIGN KEY(to_person_id) REFERENCES persons(id)
        )",
        [],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn create_person(person: Person, state: State<DbState>) -> Result<Person, String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute(
        "INSERT INTO persons (id, first_name, last_name, birth_date, death_date, photo, generation, position_x, position_y, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            &person.id,
            &person.first_name,
            &person.last_name,
            &person.birth_date,
            &person.death_date,
            &person.photo,
            &person.generation,
            &person.position_x,
            &person.position_y,
            &person.created_at,
            &person.updated_at,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(person)
}

#[tauri::command]
fn get_person(id: String, state: State<DbState>) -> Result<Option<Person>, String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, first_name, last_name, birth_date, death_date, photo, generation, position_x, position_y, created_at, updated_at 
         FROM persons WHERE id = ?1"
    ).map_err(|e| e.to_string())?;

    let person = stmt.query_row([&id], |row| {
        Ok(Person {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            birth_date: row.get(3)?,
            death_date: row.get(4)?,
            photo: row.get(5)?,
            generation: row.get(6)?,
            position_x: row.get(7)?,
            position_y: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).optional().map_err(|e| e.to_string())?;

    Ok(person)
}

#[tauri::command]
fn get_all_persons(state: State<DbState>) -> Result<Vec<Person>, String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, first_name, last_name, birth_date, death_date, photo, generation, position_x, position_y, created_at, updated_at 
         FROM persons"
    ).map_err(|e| e.to_string())?;

    let persons = stmt.query_map([], |row| {
        Ok(Person {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            birth_date: row.get(3)?,
            death_date: row.get(4)?,
            photo: row.get(5)?,
            generation: row.get(6)?,
            position_x: row.get(7)?,
            position_y: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>>>()
    .map_err(|e| e.to_string())?;

    Ok(persons)
}

#[tauri::command]
fn update_person(person: Person, state: State<DbState>) -> Result<Person, String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute(
        "UPDATE persons SET first_name = ?1, last_name = ?2, birth_date = ?3, 
         death_date = ?4, photo = ?5, generation = ?6, position_x = ?7, position_y = ?8, updated_at = ?9 WHERE id = ?10",
        rusqlite::params![
            &person.first_name,
            &person.last_name,
            &person.birth_date,
            &person.death_date,
            &person.photo,
            &person.generation,
            &person.position_x,
            &person.position_y,
            &person.updated_at,
            &person.id,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(person)
}

#[tauri::command]
fn delete_person(id: String, state: State<DbState>) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute("DELETE FROM persons WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn create_relationship(relationship: Relationship, state: State<DbState>) -> Result<Relationship, String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute(
        "INSERT INTO relationships (id, from_person_id, to_person_id, rel_type, spouse_type,
         marriage_number, start_date, end_date, color, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            &relationship.id,
            &relationship.from_person_id,
            &relationship.to_person_id,
            &relationship.rel_type,
            &relationship.spouse_type,
            &relationship.marriage_number,
            &relationship.start_date,
            &relationship.end_date,
            &relationship.color,
            &relationship.created_at,
            &relationship.updated_at,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(relationship)
}

#[tauri::command]
fn get_relationship(id: String, state: State<DbState>) -> Result<Option<Relationship>, String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, from_person_id, to_person_id, rel_type, spouse_type, marriage_number,
         start_date, end_date, color, created_at, updated_at 
         FROM relationships WHERE id = ?1"
    ).map_err(|e| e.to_string())?;

    let relationship = stmt.query_row([&id], |row| {
        Ok(Relationship {
            id: row.get(0)?,
            from_person_id: row.get(1)?,
            to_person_id: row.get(2)?,
            rel_type: row.get(3)?,
            spouse_type: row.get(4)?,
            marriage_number: row.get(5)?,
            start_date: row.get(6)?,
            end_date: row.get(7)?,
            color: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).optional().map_err(|e| e.to_string())?;

    Ok(relationship)
}

#[tauri::command]
fn get_all_relationships(state: State<DbState>) -> Result<Vec<Relationship>, String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, from_person_id, to_person_id, rel_type, spouse_type, marriage_number,
         start_date, end_date, color, created_at, updated_at 
         FROM relationships"
    ).map_err(|e| e.to_string())?;

    let relationships = stmt.query_map([], |row| {
        Ok(Relationship {
            id: row.get(0)?,
            from_person_id: row.get(1)?,
            to_person_id: row.get(2)?,
            rel_type: row.get(3)?,
            spouse_type: row.get(4)?,
            marriage_number: row.get(5)?,
            start_date: row.get(6)?,
            end_date: row.get(7)?,
            color: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>>>()
    .map_err(|e| e.to_string())?;

    Ok(relationships)
}

#[tauri::command]
fn get_relationships_for_person(person_id: String, state: State<DbState>) -> Result<Vec<Relationship>, String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, from_person_id, to_person_id, rel_type, spouse_type, marriage_number,
         start_date, end_date, color, created_at, updated_at 
         FROM relationships WHERE from_person_id = ?1 OR to_person_id = ?1"
    ).map_err(|e| e.to_string())?;

    let relationships = stmt.query_map([&person_id], |row| {
        Ok(Relationship {
            id: row.get(0)?,
            from_person_id: row.get(1)?,
            to_person_id: row.get(2)?,
            rel_type: row.get(3)?,
            spouse_type: row.get(4)?,
            marriage_number: row.get(5)?,
            start_date: row.get(6)?,
            end_date: row.get(7)?,
            color: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>>>()
    .map_err(|e| e.to_string())?;

    Ok(relationships)
}

#[tauri::command]
fn update_relationship(relationship: Relationship, state: State<DbState>) -> Result<Relationship, String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute(
        "UPDATE relationships SET from_person_id = ?1, to_person_id = ?2, rel_type = ?3,
         spouse_type = ?4, marriage_number = ?5, start_date = ?6, end_date = ?7,
         color = ?8, updated_at = ?9 WHERE id = ?10",
        rusqlite::params![
            &relationship.from_person_id,
            &relationship.to_person_id,
            &relationship.rel_type,
            &relationship.spouse_type,
            &relationship.marriage_number,
            &relationship.start_date,
            &relationship.end_date,
            &relationship.color,
            &relationship.updated_at,
            &relationship.id,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(relationship)
}

#[tauri::command]
fn delete_relationship(id: String, state: State<DbState>) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    
    conn.execute("DELETE FROM relationships WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    let conn = Connection::open("familytree.db").expect("Failed to open database");
    
    tauri::Builder::default()
        .manage(DbState {
            conn: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![
            init_database,
            create_person,
            get_person,
            get_all_persons,
            update_person,
            delete_person,
            create_relationship,
            get_relationship,
            get_all_relationships,
            get_relationships_for_person,
            update_relationship,
            delete_relationship,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
