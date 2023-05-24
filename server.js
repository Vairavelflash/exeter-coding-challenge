const fs = require('fs');
const { promisify } = require('util');
const csv = require('csv-parser');
const { resolve } = require('path');
var process = require('process')

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const start = Date.now();

// File paths 
const file1Path = './t8.shakespeare.txt';
const file2Path = './find_words.txt';
const filename = 'french_dictionary.csv';
let words,find_data =""

const convertMillisecondsToTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} minutes ${seconds} seconds ${milliseconds} ms`;
};

//Read CSV file and convert to Hashmap
const readCSVFileAsync = async (filename) => {
  try {
    const fileContent = await readFileAsync(filename, 'utf8');

    return new Promise((resolve, reject) => {
      const csvdata = [];
      fs.createReadStream("./french_dictionary.csv")
      .pipe(csv({headers: true}))
      .on("data", (data) => {
        const key = data._0;
    const value = data._1;
    // console.log(key,value);
    csvdata.push([key,value]);
      })
      .on("end", () => {
        // console.log(csvdata);
        console.log("csv data read")
        resolve(csvdata)
      });
    });
  } catch (error) {
    throw new Error(`Error reading CSV file: ${error}`);
  }
};

// Create csv file with first “English Word”, second “French Word” and third “Frequency”
async function createCSVfile(word,Hashmap,count){
  const filename = 'frequency.csv';
await fs.appendFile(filename, `${word} , ${Hashmap.get(word)},${count}\n`, 'utf8', (err) => {
if (err) {
console.error('An error occurred:', err);
} else {
console.log(`CSV file "${filename}" has been created successfully.`);
}
return 'completed'
});
}

const replaceStringInFileAsync = async (file1Path, searchString, replacementString) => {
  try {
    // console.log(searchString, replacementString)
      let time_taken=0
      const fileContent = await readFileAsync(file1Path, 'utf8');
      const modifiedContent = fileContent.replace(new RegExp(searchString, 'g'), replacementString);
  
      await writeFileAsync('t8.shakespeare.translated.txt', modifiedContent, 'utf8');
  
      console.log('String replaced successfully in the file.');
    } catch (error) {
      throw new Error(`Error replacing string in file: ${error}`);
    }
    
    
    resolve();
};

// Spliting each word in find_words.txt file
function checkWordInFile(file1Path, word,Hashmap) {
  return new Promise((resolve, reject) => {
    fs.readFile(file1Path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {

        var rgxp = new RegExp(`\\b${word}(?:s\\b|\\b)`, 'gi');
        let count = (data.match(rgxp) || []).length;
        find_data = ">"+word+"--"+count+'\n'
        // console.log(word ,'-' , Hashmap.get(word),'-',count)
     
        let Hashmap_data = Hashmap.get(word)
        
      //  createCSVfile(word,Hashmap,count)   //For creating csv frequency file
     
        
        replaceStringInFileAsync(file1Path, word, Hashmap_data)
        .then(() => {
          
          console.log('File processing complete.');
          // for (const [key,value] of Object.entries(process.memoryUsage())){
          //   const end = Date.now();
          //   let result = convertMillisecondsToTime(end-start);
          //   let data = `Time to process:e: ${result}`+`\nMemory used: rss:${process.memoryUsage().rss/1000000}MB\n
          //   heapTotal:${process.memoryUsage().heapTotal/1000000}MB\n
          //   heapUsed:${process.memoryUsage().heapUsed/1000000}MB\n
          //   external:${process.memoryUsage().external/1000000}MB\n
          //   arrayBuffers:${process.memoryUsage().arrayBuffers/1000000}MB\n
          //   `
          //   // console.log(data)
          //   fs.writeFile("performance.txt", data, (err) => {
          //     if (err)
          //       console.log(err);
          //     else {
          //       console.log("File written successfully\n");
          //     }})
          // }
        })
        .catch((error) => {
          console.error('An error occurred:', error);
        });
        

        resolve(find_data);
      }
    });
  });
}

function checkWordInFile2(filePath2) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath2, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          
          words = data.split(/\s+/);
          // console.log(words)
          
          resolve(words);
        }
       
      });
    });
  }


/*Order 1) Read csv file and make hash table
        2) Spliting each word in find_words.txt file
        3) It will process with file1Path, searchString, replacementString to write output file

*/
readCSVFileAsync(filename) 
  .then((data) => {
    console.log('CSV file has been processed.');
    // console.log(data);
    let Hashmap = new Map(data);  //Read csv file and make hash table
    // console.log(Hashmap)
    
    checkWordInFile2(file2Path)
    .then(foundInFile2 => {
      
      if (foundInFile2) {
        console.log("check word is present in txt file");
         for (i in words){
            // console.log(words[i])
            let word = words[i]
            checkWordInFile(file1Path,word,Hashmap)
           
          }
      } else {
        console.log(`The word  is not found in file2.`);
      }
    })
    
    .catch(err => {
      console.error('An error occurred:', err);
    });

  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });




