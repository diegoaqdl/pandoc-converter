use std::path::{Path, PathBuf};
use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
struct FormatInfo {
    extension: String,
    format: String,
    supported_outputs: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct ConversionResult {
    success: bool,
    message: String,
    output_path: Option<String>,
}

fn find_resource_file(app: &tauri::AppHandle, file_name: &str) -> Option<PathBuf> {
    let mut candidates = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join(file_name));
        candidates.push(resource_dir.join("resources").join(file_name));
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join(file_name));
            candidates.push(exe_dir.join("resources").join(file_name));
        }
    }

    let manifest_resources = Path::new(env!("CARGO_MANIFEST_DIR")).join("resources");
    candidates.push(manifest_resources.join(file_name));

    candidates.into_iter().find(|path| path.exists())
}

// Detect file format from extension
#[tauri::command]
fn detect_format(file_path: String) -> Result<FormatInfo, String> {
    let path = Path::new(&file_path);
    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let (format, supported_outputs) = match extension.as_str() {
        "md" | "markdown" => ("markdown", vec!["pdf", "docx", "html", "epub", "pptx"]),
        "docx" => ("docx", vec!["pdf", "md", "html", "epub", "txt"]),
        "html" | "htm" => ("html", vec!["pdf", "docx", "md", "epub", "txt"]),
        "txt" => ("plain", vec!["pdf", "docx", "md", "html", "epub"]),
        "rst" => ("rst", vec!["pdf", "docx", "html", "md", "epub"]),
        "epub" => ("epub", vec!["pdf", "docx", "html", "md", "txt"]),
        "tex" | "latex" => ("latex", vec!["pdf", "docx", "html", "md"]),
        "odt" => ("odt", vec!["pdf", "docx", "html", "md"]),
        "rtf" => ("rtf", vec!["pdf", "docx", "html", "md"]),
        _ => return Err(format!("Unsupported file format: .{}", extension)),
    };

    Ok(FormatInfo {
        extension: extension.to_string(),
        format: format.to_string(),
        supported_outputs: supported_outputs.iter().map(|s| s.to_string()).collect(),
    })
}

// Convert document using Pandoc
#[tauri::command]
fn convert_document(
    app: tauri::AppHandle,
    input_path: String,
    output_format: String,
    output_path: Option<String>,
) -> Result<ConversionResult, String> {
    // Determine output path
    let input_path_obj = Path::new(&input_path);
    let final_output_path = match output_path {
        Some(p) => p,
        None => {
            let stem = input_path_obj.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("output");
            input_path_obj
                .parent()
                .unwrap_or(Path::new("."))
                .join(format!("{}.{}", stem, output_format))
                .to_string_lossy()
                .to_string()
        }
    };

    // Build pandoc command
    let mut cmd = Command::new("pandoc");
    cmd.arg(&input_path)
        .arg("-o")
        .arg(&final_output_path)
        .arg("--standalone");

    // Add PDF-specific settings if converting to PDF
    if output_format == "pdf" {
        let yaml_path = find_resource_file(&app, "modern-pdf.yaml")
            .ok_or_else(|| "Could not find modern-pdf.yaml for PDF export.".to_string())?;
        let header_path = find_resource_file(&app, "modern-pdf-header.tex")
            .ok_or_else(|| "Could not find modern-pdf-header.tex for PDF export.".to_string())?;

        cmd.arg("--defaults").arg(&yaml_path);
        cmd.arg("-H").arg(&header_path);

        if let Some(input_dir) = input_path_obj.parent() {
            let pdf_resource_dir = yaml_path.parent().unwrap_or(Path::new("."));
            let resource_path = std::env::join_paths([input_dir, pdf_resource_dir])
                .map_err(|e| format!("Failed to prepare resource path: {}", e))?;
            cmd.arg("--resource-path").arg(resource_path);
        }
    }

    // Execute pandoc
    let output = cmd.output()
        .map_err(|e| format!("Failed to execute pandoc: {}. Make sure Pandoc is installed and in PATH.", e))?;

    if output.status.success() {
        Ok(ConversionResult {
            success: true,
            message: format!("Successfully converted to {}", output_format),
            output_path: Some(final_output_path),
        })
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Pandoc conversion failed: {}", error_msg))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![detect_format, convert_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
