const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function extractAudio(inputVideoPath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    // Use local ffmpeg.exe in backend folder
    const ffmpegPath = path.join(__dirname, '../../ffmpeg.exe');
    
    // Check if ffmpeg.exe exists
    if (!fs.existsSync(ffmpegPath)) {
      console.error('❌ FFmpeg not found at:', ffmpegPath);
      reject(new Error(`FFmpeg executable not found at ${ffmpegPath}`));
      return;
    }
    
    console.log('✅ FFmpeg found at:', ffmpegPath);
    console.log('📁 Input video path:', inputVideoPath);
    console.log('📁 Output audio path:', outputAudioPath);
    
    // Check if input file exists
    if (!fs.existsSync(inputVideoPath)) {
      console.error('❌ Input video file not found:', inputVideoPath);
      reject(new Error(`Input video file not found: ${inputVideoPath}`));
      return;
    }
    
    // ffmpeg -i input -vn -acodec pcm_s16le -ar 16000 -ac 1 out.wav
    const args = [
      '-y',  // Overwrite output file
      '-i', inputVideoPath,
      '-vn',  // No video
      '-acodec', 'pcm_s16le',  // Audio codec
      '-ar', '16000',  // Sample rate
      '-ac', '1',  // Mono audio
      outputAudioPath
    ];
    
    console.log('🔧 FFmpeg command:', ffmpegPath, args.join(' '));
    
    const ffmpeg = spawn(ffmpegPath, args);
    
    let stderrOutput = '';
    
    ffmpeg.on('error', (err) => {
      console.error('❌ FFmpeg spawn error:', err);
      reject(err);
    });
    
    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      stderrOutput += output;
      console.log('🔧 FFmpeg stderr:', output.trim());
    });
    
    ffmpeg.on('exit', (code) => {
      console.log('🔧 FFmpeg exit code:', code);
      if (code === 0) {
        console.log('✅ FFmpeg completed successfully');
        resolve();
      } else {
        console.error('❌ FFmpeg failed with code:', code);
        console.error('❌ FFmpeg stderr output:', stderrOutput);
        reject(new Error(`FFmpeg exited with code ${code}. Output: ${stderrOutput}`));
      }
    });
  });
}

module.exports = { extractAudio };
