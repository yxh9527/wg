<template>
  <canvas
    ref="canvas"
    class="atlas-sprite"
    :style="canvasStyle"
  />
</template>

<script>
const imageCache = new Map();
const atlasCropCanvas = document.createElement("canvas");
const atlasCropCtx = atlasCropCanvas.getContext("2d");
const frameCanvas = document.createElement("canvas");
const frameCtx = frameCanvas.getContext("2d");
const composeCanvas = document.createElement("canvas");
const composeCtx = composeCanvas.getContext("2d");

function loadImage(url) {
  if (!url) return Promise.resolve(null);
  if (imageCache.has(url)) return imageCache.get(url);

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  imageCache.set(url, promise);
  return promise;
}

export default {
  name: "AtlasSprite",
  props: {
    atlas: {
      type: Object,
      default: null,
    },
    frameKey: {
      type: [String, Number],
      default: "",
    },
    maxWidth: {
      type: Number,
      default: 48,
    },
    maxHeight: {
      type: Number,
      default: 48,
    },
  },
  data() {
    return {
      renderedWidth: 0,
      renderedHeight: 0,
    };
  },
  computed: {
    frame() {
      if (!this.atlas || !this.atlas.frames) return null;
      return this.atlas.frames[String(this.frameKey)] || null;
    },
    canvasStyle() {
      return {
        width: `${this.renderedWidth || 0}px`,
        height: `${this.renderedHeight || 0}px`,
      };
    },
  },
  watch: {
    atlas: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.renderSprite());
      },
    },
    frameKey() {
      this.$nextTick(() => this.renderSprite());
    },
  },
  mounted() {
    this.renderSprite();
  },
  methods: {
    async renderSprite() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      if (!this.atlas || !this.atlas.url || !this.frame) {
        this.renderedWidth = 0;
        this.renderedHeight = 0;
        canvas.width = 1;
        canvas.height = 1;
        const emptyCtx = canvas.getContext("2d");
        emptyCtx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const frame = this.frame;
      const trimmedWidth = Number(frame.width || frame.originalWidth || 1);
      const trimmedHeight = Number(frame.height || frame.originalHeight || 1);
      const originalWidth = Number(frame.originalWidth || trimmedWidth || 1);
      const originalHeight = Number(frame.originalHeight || trimmedHeight || 1);
      const shouldRotate = !!(frame.rotated && !(this.atlas && this.atlas.ignoreRotation));
      const swapRotatedSize = !!(shouldRotate && this.atlas && this.atlas.swapRotatedSize);
      const atlasWidth = swapRotatedSize ? trimmedHeight : trimmedWidth;
      const atlasHeight = swapRotatedSize ? trimmedWidth : trimmedHeight;
      const logicalWidth = originalWidth;
      const logicalHeight = originalHeight;
      const scale = Math.min(this.maxWidth / logicalWidth, this.maxHeight / logicalHeight, 1);
      const drawWidth = Math.max(1, Math.round(logicalWidth * scale));
      const drawHeight = Math.max(1, Math.round(logicalHeight * scale));
      const dpr = window.devicePixelRatio || 1;

      this.renderedWidth = drawWidth;
      this.renderedHeight = drawHeight;
      canvas.width = drawWidth * dpr;
      canvas.height = drawHeight * dpr;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) {
        ctx.imageSmoothingQuality = "high";
      }

      try {
        const image = await loadImage(frame.url || this.atlas.url);
        if (!image) return;

        const sourceX = Number(frame.x || 0);
        const sourceY = Number(frame.y || 0);
        const offsetX = Number((frame.offset && frame.offset.x) || frame.offsetX || 0);
        const offsetY = Number((frame.offset && frame.offset.y) || frame.offsetY || 0);

        atlasCropCanvas.width = Math.max(1, atlasWidth);
        atlasCropCanvas.height = Math.max(1, atlasHeight);
        atlasCropCtx.setTransform(1, 0, 0, 1, 0, 0);
        atlasCropCtx.clearRect(0, 0, atlasCropCanvas.width, atlasCropCanvas.height);
        atlasCropCtx.imageSmoothingEnabled = false;
        atlasCropCtx.drawImage(
          image,
          sourceX,
          sourceY,
          atlasWidth,
          atlasHeight,
          0,
          0,
          atlasWidth,
          atlasHeight
        );

        frameCanvas.width = Math.max(1, trimmedWidth);
        frameCanvas.height = Math.max(1, trimmedHeight);
        frameCtx.setTransform(1, 0, 0, 1, 0, 0);
        frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        frameCtx.imageSmoothingEnabled = false;

        if (shouldRotate) {
          const rotateDegrees =
            Number.isFinite(Number(frame.rotateDegrees))
              ? Number(frame.rotateDegrees)
              : this.atlas && Number.isFinite(Number(this.atlas.rotateDegrees))
              ? Number(this.atlas.rotateDegrees)
              : 90;
          frameCtx.translate(trimmedWidth / 2, trimmedHeight / 2);
          frameCtx.rotate((rotateDegrees * Math.PI) / 180);
          frameCtx.drawImage(
            atlasCropCanvas,
            -atlasWidth / 2,
            -atlasHeight / 2,
            atlasWidth,
            atlasHeight
          );
        } else {
          frameCtx.drawImage(atlasCropCanvas, 0, 0, atlasWidth, atlasHeight, 0, 0, trimmedWidth, trimmedHeight);
        }

        composeCanvas.width = Math.max(1, originalWidth);
        composeCanvas.height = Math.max(1, originalHeight);
        composeCtx.setTransform(1, 0, 0, 1, 0, 0);
        composeCtx.clearRect(0, 0, composeCanvas.width, composeCanvas.height);
        composeCtx.imageSmoothingEnabled = false;

        const drawX = Math.round((originalWidth - trimmedWidth) / 2 + offsetX);
        const drawY = Math.round((originalHeight - trimmedHeight) / 2 - offsetY);
        composeCtx.drawImage(frameCanvas, drawX, drawY, trimmedWidth, trimmedHeight);

        ctx.drawImage(composeCanvas, 0, 0, originalWidth, originalHeight, 0, 0, drawWidth, drawHeight);
      } catch (error) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
  },
};
</script>

<style scoped>
.atlas-sprite {
  display: block;
}
</style>
