const WebSocket = require('ws');
const PORT = 8080;
const wss = new  WebSocket.Server({ port: PORT });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

const stockData = [
  {
    "code": "LSE",
    "stockExchange": "London Stock Exchange",
    "topStocks": [
      { "code": "CRDA", "stockName": "CRODA INTERNATIONAL PLC", "price": 4807.00 },
      { "code": "GSK", "stockName": "GSK PLC", "price": 1574.80 },
      { "code": "ANTO", "stockName": "ANTOFAGASTA PLC", "price": 1746.00 },
      { "code": "FLTR", "stockName": "FLUTTER ENTERTAINMENT PLC", "price": 16340.00 },
      { "code": "BDEV", "stockName": "BARRATT DEVELOPMENTS PLC", "price": 542.60 }
    ]
  },
  {
    "code": "NYSE",
    "stockExchange": "New York Stock Exchange",
    "topStocks": [
      { "code": "AHT", "stockName": "Ashford Hospitality Trust", "price": 1.72 },
      { "code": "KUKE", "stockName": "Kuke Music Holding Ltd", "price": 1.20 },
      { "code": "ASH", "stockName": "Ashland Inc.", "price": 93.42 },
      { "code": "NMR", "stockName": "Nomura Holdings Inc.", "price": 5.84 },
      { "code": "LC", "stockName": "LendingClub Corp", "price": 9.71 }
    ]
  },
  {
    "code": "NASDAQ",
    "stockExchange": "Nasdaq",
    "topStocks": [
      { "code": "AMD", "stockName": "Advanced Micro Devices, Inc.", "price": 164.21 },
      { "code": "TSLA", "stockName": "Tesla, Inc.", "price": 190.35 },
      { "code": "SOFI", "stockName": "SoFi Technologies, Inc.", "price": 8.24 },
      { "code": "PARA", "stockName": "Paramount Global", "price": 14.92 },
      { "code": "GOOGL", "stockName": "Alphabet Inc.", "price": 141.91 }
    ]
  }
];

wss.on('connection', (ws) => {
  console.log('Client connected');

	const stockExchanges = stockData.map((exchange) => ({
		stockExchange: exchange.stockExchange,
		code: exchange.code 
	}));

	const initialMessage = {
		text: 'Please select a stock exchange:',
		fromUser: false,
		stockExchanges: stockExchanges
	};
	const ERR = "Sorry, I couldn't find that record. Please type the name or the code. If you are lazy, you could just click on the menu :)";
	
	ws.send(JSON.stringify(initialMessage));
	
	ws.on('message', (data) => {
		
	  const messageString = data.toString(); 
	  console.log('Received:', messageString);
	  ws.send(messageString);  
		  
	  try {
		const message = JSON.parse(messageString);
		
		//1. Send first default options
		if (message.text === 'MainMenu') {
		  const stockExchanges = stockData.map(exchange => ({
			stockExchange: exchange.stockExchange,
			code: exchange.code
		  }));

		  ws.send(JSON.stringify({
			text: 'Please select a stock exchange:',
			fromUser: false,
			stockExchanges: stockExchanges
		  }));
		  return;
		}

		//2. Check to get the specific StockExchange
		if(message.step == 'topStocks') {
			const selectedExchange = stockData.find(exchange => 
			  exchange.code?.toLowerCase()?.trim() === message.text?.toLowerCase()?.trim() || 
			  exchange.stockName?.toLowerCase()?.trim() === message.text?.toLowerCase()?.trim()
			);

			if (selectedExchange) {
			  ws.send(JSON.stringify({
				text: 'Please select a stock:',
				fromUser: false,
				topStocks: selectedExchange.topStocks
			  }));
			  return;
			} else {
			  ws.send(JSON.stringify({
				text: ERR,
				fromUser: false,
				error: true
			  }));
			  return;
			}
		}

		//3. Check for selected stock after exchange is found
		if(message.step == 'prices') {
			const selectedStock = stockData
			  .flatMap(exchange => exchange.topStocks)
			  .find(stock => 
				stock.code?.toLowerCase()?.trim() === message.text?.toLowerCase()?.trim() || 
				stock.stockName?.toLowerCase()?.trim() === message.text?.toLowerCase()?.trim()
			  );
			if (selectedStock) {
			  ws.send(JSON.stringify({
				text: `Stock price of ${selectedStock.stockName} is ${selectedStock.price}. Please select an option.`,
				fromUser: false,
				selectedStock: {
				  stockName: selectedStock.stockName,
				  price: selectedStock.price
				}
			  }));
			} else {
			  ws.send(JSON.stringify({
				text: ERR,
				fromUser: false,
				error: true
			  }));
			}
		}

	  } catch (error) {
		console.error('Error parsing message:', error);
	  }
	});


  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', (error) => console.error('WebSocket error:', error));
});


