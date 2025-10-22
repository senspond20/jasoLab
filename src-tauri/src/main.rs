use std::fs;
use tauri_plugin_dialog;
use unicode_normalization::{UnicodeNormalization};
use serde_json::json;
use std::path::PathBuf;

fn is_jaso_separated(name: &str) -> bool {
    name.chars().any(|c| {
        let code = c as u32;
        (0x1100..=0x11FF).contains(&code)    // 현대 한글 자모
            || (0x3130..=0x318F).contains(&code) // 호환 자모
            || (0xA960..=0xA97F).contains(&code) // 자모 확장 A
            || (0xD7B0..=0xD7FF).contains(&code) // 자모 확장 B
    })
}


#[tauri::command]
fn list_jaso_files(dir_path: String) -> Vec<serde_json::Value> {
    let mut result = vec![];

    if let Ok(entries) = fs::read_dir(&dir_path) {
        for entry in entries.flatten() {

          if let Ok(meta) = entry.metadata() {
                let is_dir = meta.is_dir(); // 실제 폴더 여부 구분

                if let Some(name) = entry.file_name().to_str() {
                    let has_jamo = is_jaso_separated(name);

                    let display_name = if has_jamo {
                        name.nfd().flat_map(|c| [c, '\u{200C}']).collect()
                    } else {
                        name.nfc().collect::<String>()
                    };

                    let extension = if is_dir {
                        "".to_string() // 폴더는 확장자 없음
                    } else {
                        entry
                            .path()
                            .extension()
                            .and_then(|e| e.to_str())
                            .unwrap_or("")
                            .to_lowercase()
                    };

                    result.push(json!({
                        "name": display_name,
                        "path": entry.path().display().to_string(),
                        "ext": extension,
                        "jaso": has_jamo,
                        "isDir": is_dir,
                        "selected": has_jamo 
                    }));
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


#[tauri::command]
fn force_jaso_split(file_paths: Vec<String>) -> serde_json::Value {
    use std::path::PathBuf;
    use unicode_normalization::UnicodeNormalization;
    use serde_json::json;
    use std::fs;

    let mut results = vec![];

    for path_str in file_paths {
        let path = PathBuf::from(&path_str);

        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            let decomposed = name.nfd().collect::<String>(); // 🔥 자소분리
            let parent = path.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| PathBuf::from(".")); // ✅ 수정된 부분
            let new_path = parent.join(&decomposed);

            match fs::rename(&path, &new_path) {
                Ok(_) => results.push(json!({
                    "old": path.display().to_string(),
                    "new": new_path.display().to_string(),
                    "status": "ok"
                })),
                Err(e) => results.push(json!({
                    "old": path.display().to_string(),
                    "error": e.to_string(),
                    "status": "error"
                })),
            }
        }
    }

    json!({ "results": results })
}

#[tauri::command]
fn compose_jaso_files(file_paths: Vec<String>) -> serde_json::Value {
    let mut results = vec![];

    for path_str in file_paths {
        let path = PathBuf::from(&path_str);

        if let Some(file_name_os) = path.file_name() {
            if let Some(file_name) = file_name_os.to_str() {
                // 자소 합성 (NFC)
                let composed = file_name.nfc().collect::<String>();

                // 새 경로 생성
                let new_path = path.with_file_name(&composed);

                // 이름이 이미 같다면 skip
                if path == new_path {
                    results.push(json!({
                        "old": path.display().to_string(),
                        "new": new_path.display().to_string(),
                        "status": "skip"
                    }));
                    continue;
                }

                // 파일 이름 변경
                match fs::rename(&path, &new_path) {
                    Ok(_) => results.push(json!({
                        "old": path.display().to_string(),
                        "new": new_path.display().to_string(),
                        "status": "ok"
                    })),
                    Err(e) => results.push(json!({
                        "old": path.display().to_string(),
                        "error": e.to_string(),
                        "status": "error"
                    })),
                }
            }
        }
    }

    json!({ "results": results })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![list_jaso_files, compose_jaso_files, force_jaso_split])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
