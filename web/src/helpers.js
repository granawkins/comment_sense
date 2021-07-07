function thousands_separators(num) {
    if (typeof(num) !== 'number') {
        try {
            return (thousands_separators(parseInt(num)))
        } catch (e) {
            return num
        }
    } else {
        var num_parts = num.toString().split(".");
        num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return num_parts.join(".");
    }
}

export { thousands_separators }