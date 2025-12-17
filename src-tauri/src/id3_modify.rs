use anyhow::{Context, Result};
use id3::{Tag, TagLike, Version};
use std::fs;
use std::path::Path;

pub fn id3_modify(
    file_path: &str,
    export_path: &str,
    artist: &str,
    title: &str,
    album: &str,
) -> Result<String> {
    let original_file = Path::new(file_path);
    if !original_file.exists() {
        anyhow::bail!("Source file not found: {}", original_file.display());
    }

    let mut tag = match Tag::read_from_path(original_file) {
        Ok(tag) => tag,
        Err(e) if matches!(e.kind, id3::ErrorKind::NoTag) => Tag::new(),
        Err(e) => return Err(anyhow::Error::msg(format!("Failed to read ID3 tag: {}", e))),
    };

    tag.set_artist(artist);
    tag.set_title(title);
    tag.set_album(album);

    let export_dir = Path::new(export_path);
    fs::create_dir_all(export_dir).with_context(|| {
        format!(
            "Failed to create export directory: {}",
            export_dir.display()
        )
    })?;

    let new_file = export_dir.join(format!("{} - {}.mp3", artist, title));

    fs::copy(original_file, &new_file)
        .with_context(|| format!("Failed to copy file to {}", new_file.display()))?;

    tag.write_to_path(&new_file, Version::Id3v24)
        .with_context(|| format!("Failed to write ID3 tag to {}", new_file.display()))?;

    Ok(format!("Successfully saved to {}", new_file.display()))
}
