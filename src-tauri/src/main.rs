use std::fs;
use tauri_plugin_dialog;
use unicode_normalization::{UnicodeNormalization, is_nfd_quick, IsNormalized};
use serde_json::json;

#[tauri::command]
fn list_jaso_files(dir_path: String) -> Vec<serde_json::Value> {
    let mut result = vec![];

    if let Ok(entries) = fs::read_dir(&dir_path) {
        for entry in entries.flatten() {
            if let Ok(meta) = entry.metadata() {
                if meta.is_file() {
                    if let Some(name) = entry.file_name().to_str() {

                        let has_jamo = name.chars().any(|c| {
                            let code = c as u32;
                            (0x1100..=0x11FF).contains(&code)    // 현대 한글 자모
                                || (0x3130..=0x318F).contains(&code) // 호환 자모
                                || (0xA960..=0xA97F).contains(&code) // 자모 확장 A
                                || (0xD7B0..=0xD7FF).contains(&code) // 자모 확장 B
                        });

                        let display_name = if has_jamo {
                            name.nfd().flat_map(|c| [c, '\u{200C}']) // ← 합성 방지
                            .collect()
                        } else {
                            name.nfc().collect::<String>()
                        };
                        
                        let extension = entry
                            .path()
                            .extension()
                            .and_then(|e| e.to_str())
                            .unwrap_or("")
                            .to_lowercase();

                        result.push(json!({
                            "name": display_name,
                            "path": entry.path().display().to_string(),
                            "ext": extension,
                            "jaso" : has_jamo,
                            "selected": has_jamo
                        }));
                    }
                }
            }
        }
    }
    // 정렬: 자모 분리형(true) → 조합형(false), 확장자, 파일명 순
    result.sort_by(|a, b| {
        let sel_a = a["selected"].as_bool().unwrap_or(false);
        let sel_b = b["selected"].as_bool().unwrap_or(false);

        match sel_b.cmp(&sel_a) { // true 먼저
            std::cmp::Ordering::Equal => {
                let ext_a = a["ext"].as_str().unwrap_or("");
                let ext_b = b["ext"].as_str().unwrap_or("");
                match ext_a.cmp(ext_b) {
                    std::cmp::Ordering::Equal => {
                        let name_a = a["name"].as_str().unwrap_or("");
                        let name_b = b["name"].as_str().unwrap_or("");
                        name_a.cmp(name_b)
                    }
                    other => other,
                }
            }
            other => other,
        }
    });

    result
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![list_jaso_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
