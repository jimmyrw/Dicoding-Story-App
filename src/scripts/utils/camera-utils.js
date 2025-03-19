class CameraUtils {
    #stream = null;
    #video = null;
    #canvas = null;
    #captureButton = null;
    #imagePreview = null;
    #fileInput = null;
  
    constructor({
      video,
      canvas,
      captureButton,
      imagePreview,
      fileInput,
    }) {
      this.#video = video;
      this.#canvas = canvas;
      this.#captureButton = captureButton;
      this.#imagePreview = imagePreview;
      this.#fileInput = fileInput;
  
      this.#setupEventListeners();
    }
  
    async start() {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment',
          },
          audio: false,
        };
  
        this.#stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.#video.srcObject = this.#stream;
        this.#video.play();
        this.#video.style.display = 'block';
        this.#captureButton.disabled = false;
      } catch (error) {
        console.error('Error accessing camera:', error);
        // Handle by showing an error or falling back to file upload
        alert('Camera access failed. Please use the file upload instead.');
      }
    }
  
    stop() {
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => {
          track.stop();
        });
        this.#stream = null;
        this.#video.srcObject = null;
        this.#video.style.display = 'none';
      }
    }
  
    capture() {
      const context = this.#canvas.getContext('2d');
      this.#canvas.width = this.#video.videoWidth;
      this.#canvas.height = this.#video.videoHeight;
      context.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
  
      // Convert to blob
      this.#canvas.toBlob((blob) => {
        const capturedImage = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        
        // Create a data transfer object and add the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(capturedImage);
        
        // Set the files property of the file input
        this.#fileInput.files = dataTransfer.files;
        
        // Display preview
        const imageUrl = URL.createObjectURL(blob);
        this.#imagePreview.src = imageUrl;
        this.#imagePreview.style.display = 'block';
        
        // Stop camera
        this.stop();
      }, 'image/jpeg');
    }
  
    #setupEventListeners() {
      this.#captureButton.addEventListener('click', () => {
        this.capture();
      });
    }
  }
  
  export default CameraUtils;