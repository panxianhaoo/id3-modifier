// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod id3_modify;
use id3_modify::id3_modify;

#[tauri::command]
fn modify(file_path: &str, export_path: &str, artist: &str, title: &str, album: &str) -> String {
    id3_modify(file_path, export_path, artist, title, album)
        .unwrap_or_else(|e| format!("Error: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![modify])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
