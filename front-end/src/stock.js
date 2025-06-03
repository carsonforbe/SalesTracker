//read stock data
export const readStock = async () => {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/sales/stock/");

        if(!res.ok){
            throw new Error('Failed to read file data');
        }

        const data = await res.json();

    } catch (error) {
        throw new Error('Failed to load stock data!!!');
    }
}