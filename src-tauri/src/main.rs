// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod id3_modify;

fn main() {
    id3_modify_lib::run()
}
