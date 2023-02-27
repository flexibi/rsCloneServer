export default function generate(json) {
  const jsonData = JSON.parse(String(json));
  let htmlHeader = `<head><link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Jost:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous"><link href="https://wbbuilder.000webhostapp.com/style.css" rel="stylesheet">`

  let htmlString = '';

  jsonData.forEach((block) => { // {data: string, html: boolean}
    if (block.html) {
      htmlString += block.data;
    }
  });

  jsonData.forEach((block) => { //{data: string, html: boolean, name: string}
    if (!block.html && block.name.includes(".js")) {
      htmlString += `<script> ${block.data} </script>`;
    }
  });


  jsonData.forEach((block) => {  //{data: string, html: boolean, name: string}
    if (!block.html && block.name.includes(".css")) {
      htmlHeader += `<style> ${block.data} </style>`;
    }
  });

  // let myWindow = window.open();
  // myWindow.document.write(this.htmlHeader + "</head>" + htmlString.replace(/scripter/g, "script"));
  // console.log('binding', htmlHeader + "</head>" + htmlString)
  return htmlHeader + "</head>" + htmlString
}

// const answer = bindProject(json)
// console.log(answer)
