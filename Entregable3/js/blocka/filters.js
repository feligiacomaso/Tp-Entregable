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
            const red = getRed(imageData, x, y) * 1.3;
            const green = getGreen(imageData, x, y) * 1.3;
            const blue = getBlue(imageData, x, y) * 1.3;

            const alpha = imageData.data[getIndex(imageData, x, y) + 3];

            setPixel(output, x, y, red, green, blue, alpha);
        }
    }

    return output;
}