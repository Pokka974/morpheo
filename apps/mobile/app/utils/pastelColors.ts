const getUniquePastelColors = (count: number): string[] => {
    // Random hue between 0 and 360
    const hue = Math.floor(Math.random() * 360);
    // Adjusted saturation and lightness values for a pastel effect
    const saturation = 100;
    const lightness = 90;
    const colors: string[] = [];

    // Evenly space the hues in the hue circle.
    for (let i = 0; i < count; i++) {
        const hue = Math.floor((360 * i) / count);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
};

export default getUniquePastelColors;
