function getIndex(imageData, x, y) {
    return (x + y * imageData.width) * 4;
}

export function getRed(imageData,x ,y) {
    return imageData.data[getIndex(imageData, x, y)];
}

export function getGreen(imageData, x, y) {
    return imageData.data[getIndex(imageData, x, y) + 1];
}

export function getBlue(imageData, x, y) {
    return imageData.data[getIndex(imageData, x, y) + 2];
}

export function setPixel(imageData, x, y, red, green, blue, alpha) {
    const index = getIndex(imageData, x, y);
    imageData.data[index] = red;
    imageData.data[index + 1] = green;
    imageData.data[index + 2] = blue;
    imageData.data[index + 3] = alpha;
}

export function filterGrayscale(context, imageData) {
    const output = context.createImageData(imageData.width, imageData.height);

    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const red = getRed(imageData, x, y) * 0.299;
            const green = getGreen(imageData, x, y) * 0.587;
            const blue = getBlue(imageData, x, y) * 0.114;
            const gray = red + green + blue ;

            const alpha = imageData.data[getIndex(imageData, x, y) + 3];

            setPixel(output, x, y, gray, gray, gray, alpha);
        }
    }

    return output;
}

export function filterNegative(context, imageData) {
    const output = context.createImageData(imageData.width, imageData.height);

    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const red = getRed(imageData, x, y);
            const green = getGreen(imageData, x, y);
            const blue = getBlue(imageData, x, y);

            const alpha = imageData.data[getIndex(imageData, x, y) + 3];

            setPixel(output, x, y, 255 - red, 255 - green, 255 - blue, alpha);
        }
    }

    return output;
}

export function filterBrightness(context, imageData, F) {
    const output = context.createImageData(imageData.width, imageData.height);

    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const red = getRed(imageData, x, y) * F;
            const green = getGreen(imageData, x, y) * F;
            const blue = getBlue(imageData, x, y) * F;

            const alpha = imageData.data[getIndex(imageData, x, y) + 3];

            setPixel(output, x, y, red, green, blue, alpha);
        }
    }

    return output;
}

export function filterBrightness30(context, imageData) {
    const output = context.createImageData(imageData.width, imageData.height);

    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const red = getRed(imageData, x, y) * 5;
            const green = getGreen(imageData, x, y) * 5;
            const blue = getBlue(imageData, x, y) * 5;

            const alpha = imageData.data[getIndex(imageData, x, y) + 3];

            setPixel(output, x, y, red, green, blue, alpha);
        }
    }

    return output;
}

export function filterBlur(context, imageData) {
    const V = 10;
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const destino = context.createImageData(width, height);
    const dst = destino.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, n = 0;

            for (let dy = -V; dy <= V; dy++) {
                for (let dx = -V; dx <= V; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                    const j = (nx + ny * width) * 4;
                    r += src[j];
                    g += src[j + 1];
                    b += src[j + 2];
                    n++;
                }
            }

            const i = (x + y * width) * 4;
            dst[i] = r / n;
            dst[i + 1] = g / n;
            dst[i + 2] = b / n;
            dst[i + 3] = src[i + 3];
        }
    }

    return destino;
}