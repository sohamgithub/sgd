const express = require("express");
const bodyParser = require("body-parser");

var neo4j = require('neo4j-driver');
let nodeGeocoder = require('node-geocoder');
// var cloc = require('./map.js');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

var driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', '1234')
)

var session = driver.session({
database: 'neo4j',
defaultAccessMode: neo4j.session.WRITE
});

let options = {
  provider: 'openstreetmap'
};

let geoCoder = nodeGeocoder(options);

//Routes
app.get("/", function(req, res){
  res.render("welcome")
});

app.get("/home", function(req, res){
  res.render("home")
});

app.get("/insurances", function(req, res){
  res.render("insurances");
});

app.get("/error", function(req,res){
    res.render("error");
});

app.get("/usersignup", function(req, res){
    res.render("usersignup");

});

app.post("/usersignup", async function (req,res){

  console.log(req.body);
  var email = req.body.email;
  var password = req.body.password;
  if(email=='' || password==''){
    res.redirect("/error");
  }
  else {
    try {
      await session
              .run('CREATE (a:User {email: $email , password: $pass, type: $user})', {
                email: email,
                pass: password,
                user: "user"
              })

    } catch (e) {
      console.log(e);
    }


// await bcrypt.hash(password, 10, async function(err,hashedPassword) {
// console.log(hashedPassword);


}
    res.redirect("/userlogin");

});

app.get("/userlogin", async function(req, res){
  res.render("userlogin");
});

app.post("/userlogin", async function(req,res){

  console.log(req.body);
  var email = req.body.email;
  var password = req.body.password;
  if(email=='' || password==''){
    res.redirect("/error");
  }
  else {
try {
  const result = await session
             .run(`MATCH (a:User {email: $email , type: $user})
                  RETURN a.password`, {
                    email: email,
                    user: "user"
                  })
                  console.log(result.records[0]);
                  if(result.records[0].get('a.password')==password){
                    res.redirect("/home");
                  }
                  else{
                    res.redirect("/userlogin");
                  }
} catch (e) {
  console.log(e);
}


  }

})



app.get("/adminlogin", function(req, res){
  res.render("adminlogin");
});

app.post("/adminlogin", async function(req,res){


    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    if(email=='' || password==''){
      res.redirect("/error");
    }
    if(email=="svssar@gmail.com" && password== "sab1234"){
        res.redirect("/analysis");
      }
      else{
        res.redirect("/adminlogin");
      }

})
app.get("/analysis", function(req, res){
  res.render("analysis");
});

app.get("/result", async function(req, res){
  try {
    const result = await session
               .run(`MATCH (n:H_User)
                    RETURN n.name,n.type,n.distance`)
    const result1 = await session
               .run(`MATCH (n:C_User)
                    RETURN n.name,n.type,n.distance`)
    const result2 = await session
               .run(`MATCH (n:A_User)
                    RETURN n.name,n.type,n.distance`)
                    // console.log(result);
                    var husername=[];
                    var husertype=[];
                    var huserdist=[];
                    var cusername=[];
                    var cusertype=[];
                    var cuserdist=[];
                    var ausername=[];
                    var ausertype=[];
                    var auserdist=[];
                    // console.log(husers[0]._fields);
                    for(var i=0; i<result.records.length;i++)
                    {
                      husername[i]= result.records[i].get('n.name');
                      husertype[i] = result.records[i].get('n.type');
                      huserdist[i] = result.records[i].get('n.distance');
                    }
                    for(var i=0; i<result1.records.length;i++)
                    {
                      cusername[i]= result1.records[i].get('n.name');
                      cusertype[i] = result1.records[i].get('n.type');
                      cuserdist[i] = result1.records[i].get('n.distance');
                    }
                      for(var i=0; i<result2.records.length;i++)
                      {
                      ausername[i]= result2.records[i].get('n.name');
                      ausertype[i] = result2.records[i].get('n.type');
                      auserdist[i] = result2.records[i].get('n.distance');

                    }
                    console.log(husername);
                    // result.records[0].get('a.password')

  } catch (e) {
    console.log(e);
  }
  res.render("table",{hname: husername, htype: husertype, hdist: huserdist,cname: cusername, ctype: cusertype, cdist: cuserdist,aname: ausername, atype: ausertype, adist: auserdist});
});


app.get("/fraud", async function(req, res){

  try {
    const result = await session
               .run(`MATCH (n)
                    WHERE n.type= $type
                    RETURN n.name,n.type,n.distance`, {
                      type: "fraud"
                    })

                    // console.log(result);
                    var fusername=[];
                    var fusertype=[];
                    var fuserdist=[];

                    // console.log(husers[0]._fields);
                    for(var i=0; i<result.records.length;i++)
                    {
                      fusername[i]= result.records[i].get('n.name');
                      fusertype[i] = result.records[i].get('n.type');
                      fuserdist[i] = result.records[i].get('n.distance');
                    }
                  } catch (e) {
                    console.log(e);
                  }


  res.render("fraud", {fname: fusername, ftype: fusertype, fdist: fuserdist});
});

app.get("/notfraud", async function(req, res){

  try {
    const result = await session
               .run(`MATCH (n)
                    WHERE n.type= $type
                    RETURN n.name,n.type,n.distance`, {
                      type: "not fraud"
                    })

                    // console.log(result);
                    var nfusername=[];
                    var nfusertype=[];
                    var nfuserdist=[];

                    // console.log(husers[0]._fields);
                    for(var i=0; i<result.records.length;i++)
                    {
                      nfusername[i]= result.records[i].get('n.name');
                      nfusertype[i] = result.records[i].get('n.type');
                      nfuserdist[i] = result.records[i].get('n.distance');
                    }
                  } catch (e) {
                    console.log(e);
                  }


  res.render("notfraud", {nfname: nfusername, nftype: nfusertype, nfdist: nfuserdist});
});

app.get("/map", function(req, res){
    res.sendFile(__dirname + "/map.html");
});

app.get("/health", function(req, res){
  res.render("health");
});

app.post("/health", async function(req,res){


  var name = req.body.name;
  var gender = req.body.gender;
  var age = req.body.age;
  var cno = req.body.cno;
  var address = req.body.address;
  var pin = req.body.pin;
  var occupation = req.body.occupation;
  var status = req.body.status;
  var income = req.body.income;
  var docname = req.body.docname;
  var disease = req.body.disease;
  var witnessname = req.body.witnessname;
  var date = req.body.date;
  var location = req.body.location;
  var eventlat;
  var eventlong;
  var currentlat = parseFloat(req.body.latitude);
  var currentlong = parseFloat(req.body.longitude);
  console.log(req.body);
  const result9 = await geoCoder.geocode(location);
      eventlat = result9[0].latitude;
      eventlong = result9[0].longitude;
  console.log(result9[0]);


//   geoCoder.geocode(location)
//   .then((res)=> {
//     eventlat = res[0].latitude;
//     eventlong = res[0].longitude;
//     console.log(res[0]);
//
//   })
//   .catch((err)=> {
//     console.log(err);
//   });
//

// CREATE NODE

  try {
    const results5 = await session
        .run(`WITH point({latitude: $eventlat ,longitude: $eventlong }) AS p1, point({latitude: $currentlat, longitude: $currentlong }) AS p2
              RETURN distance(p1,p2) AS dist`, {
                     eventlat: eventlat,
                     eventlong: eventlong,
                     currentlat: currentlat,
                     currentlong: currentlong
                   })
                   console.log(results5.records[0].get('dist'));
                   var dist1 = Math.floor(results5.records[0].get('dist'));
                   var dist = dist1/1000;

                     await session
                       .run('CREATE (n:H_User { name: $name , gender: $gender , age: $age, contact: $cno , address: $address , pin: $pin , occupation: $occupation , status: $status , income: $income, distance: $dist})', {
                         name: name,
                         gender: gender,
                         age: age,
                         cno: cno,
                         address: address,
                         pin: pin,
                         occupation: occupation,
                         status: status,
                         income: income,
                         dist: dist
                     })

                     await session
                             .run('CREATE (a:H_Doctor {name: $docname , disease: $disease})', {
                               docname: docname,
                               disease: disease
                             })
                     await session
                             .run('CREATE (b:H_Witness {name: $witnessname, date: $date, location: $location})', {
                                     witnessname: witnessname,
                                     date: date,
                                     location: location
                                   })

                     console.log('before');
                     // CREATE RELATIONSHIP
                     await session
                              .run(`MATCH (n:H_User),(a:H_Doctor),(b:H_Witness)
                                   WHERE n.name = $uname AND a.name = $dname AND b.name = $wname
                                   CREATE (n)-[pr:CHECKED_BY]->(a), (n)-[pf:WITNESSED_BY]->(b)
                                   RETURN n,a,b`, {
                                     uname: name,
                                     dname: docname,
                                     wname: witnessname
                                   })

                     console.log('after');
                     const result = await session
                             .run(`MATCH (a:H_Doctor),(b:H_Witness)
                                   WITH collect(a) AS a,collect(b) AS b
                                   WITH [val IN a WHERE val.name = $uname] AS duplicates1,[val IN b WHERE val.name = $uname] AS duplicates11
                                   RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11`,{uname: name})

                     const dcount1 = result.records[0].get('duplicates1').toNumber();
                     const wcount1 = result.records[0].get('duplicates11').toNumber();
                     var count1=0;
                     if(dcount1>0 || wcount1>0){
                       count1 = 1;
                     }

                     const result1 = await session
                             .run(`MATCH (a:H_User),(b:H_Witness)
                                   WITH collect(a) AS a,collect(b) AS b
                                   WITH [val IN a WHERE val.name = $dname] AS duplicates2,[val IN b WHERE val.name = $dname] AS duplicates21
                                   RETURN size(duplicates2) AS duplicates2, size(duplicates21) AS duplicates21`,{dname: docname})

                     const ucount2 = result1.records[0].get('duplicates2').toNumber();
                     const wcount2 = result1.records[0].get('duplicates21').toNumber();
                     var count2=0;
                     if(ucount2>0 || wcount2>0){
                       count2 = 1;
                     }

                     const result2 = await session
                             .run(`MATCH (a:H_Doctor),(b:H_User)
                                   WITH collect(a) AS a,collect(b) AS b
                                   WITH [val IN a WHERE val.name = $wname] AS duplicates3,[val IN b WHERE val.name = $wname] AS duplicates31
                                   RETURN size(duplicates3) AS duplicates3, size(duplicates31) AS duplicates31`,{wname: witnessname})

                     const dcount3 = result2.records[0].get('duplicates3').toNumber();
                     const ucount3 = result2.records[0].get('duplicates31').toNumber();
                     var count3=0;
                     if(dcount3>0 || ucount3>0){
                       count3 = 1;
                     }

                     if((count1>0 && count2>0) || (count1>0 && count3>0) || (count3>0 && count2>0)){
                       await session
                             .run(`MATCH (n:H_User { name: $uname })
                                   SET n.type = $type`,{
                                     uname: name,
                                     type: 'fraud'
                                   })
                     }
                     else {
                       await session
                             .run(`MATCH (n:H_User { name: $uname })
                                   SET n.type = $type`,{
                                     uname: name,
                                     type: 'not fraud'
                                   })
                     }

  } catch (e) {
    console.log(e);
  }
//
//         // console.log(results5.records[0].get('dist'));




          res.redirect("/home");

});

app.get("/crop", function(req, res){
  res.render("crop");

});

app.post("/crop", async function(req,res){

  var name = req.body.name;
  var gender = req.body.gender;
  var age = req.body.age;
  var cno = req.body.cno;
  var address = req.body.address;
  var pin = req.body.pin;
  var crops = req.body.crops;
  var agentname = req.body.agent;
  var eventname = req.body.eventname;
  var date = req.body.date;
  var location = req.body.location;
  var eventlat;
  var eventlong;
  var currentlat = parseFloat(req.body.latitude);
  var currentlong = parseFloat(req.body.longitude);
  console.log(req.body);
  const result9 = await geoCoder.geocode(location);
      eventlat = result9[0].latitude;
      eventlong = result9[0].longitude;
  console.log(result9[0]);

  try {
    const results5 = await session
        .run(`WITH point({latitude: $eventlat ,longitude: $eventlong }) AS p1, point({latitude: $currentlat, longitude: $currentlong }) AS p2
              RETURN distance(p1,p2) AS dist`, {
                     eventlat: eventlat,
                     eventlong: eventlong,
                     currentlat: currentlat,
                     currentlong: currentlong
                   })
                   console.log(results5.records[0].get('dist'));
                   var dist1 = Math.floor(results5.records[0].get('dist'));
                   var dist = dist1/1000;

    await session
      .run('CREATE (n:C_User { name: $name , gender: $gender , age: $age, contact: $cno , address: $address , pin: $pin, distance: $dist})', {
        name: name,
        gender: gender,
        age: age,
        cno: cno,
        address: address,
        pin: pin,
        dist: dist
      })
      await session
            .run('CREATE (a:C_Agent {name: $agentname})', {
              agentname: agentname
            })

      await session
        .run('CREATE (a:C_Event {name: $eventname , crops: $crops , date: $date, location: $location})', {
            eventname: eventname,
            crops: crops,
            date: date,
            location: location
          })
          console.log('before');
          // CREATE RELATIONSHIP
          await session
                   .run(`MATCH (n:C_User),(a:C_Agent),(b:C_Event)
                        WHERE n.name = $uname AND a.name = $aname AND b.name = $ename
                        CREATE (n)-[pr:MANAGED_BY]->(a), (n)-[pf:SUFFERED_BY]->(b)
                        RETURN n,a,b`, {
                          uname: name,
                          aname: agentname,
                          ename: eventname
                        })

          console.log('after');
          const result1 = await session
                  .run(`MATCH (a:C_Agent)
                        WITH collect(a) AS a
                        WITH [val IN a WHERE val.name = $uname] AS duplicates
                        RETURN size(duplicates) AS duplicates`,{uname: name})

          const ucount = result1.records[0].get('duplicates').toNumber();
          var count1=0;
          if(ucount>0){
            count1 = 1;
          }

          const result2 = await session
                  .run(`MATCH (a:C_User)
                        WITH collect(a) AS a
                        WITH [val IN a WHERE val.name = $aname] AS duplicates2
                        RETURN size(duplicates2) AS duplicates2`,{aname: agentname})

          const acount = result2.records[0].get('duplicates2').toNumber();
          var count2=0;
          if(acount>0){
            count2 = 1;
          }

          if(count1>0 && count2>0){
            await session
                  .run(`MATCH (n:C_User { name: $uname })
                        SET n.type = $type`,{
                          uname: name,
                          type: 'fraud'
                        })
          }
          else {
            await session
                  .run(`MATCH (n:C_User { name: $uname })
                        SET n.type = $type`,{
                          uname: name,
                          type: 'not fraud'
                        })
          }
  } catch (e) {
      console.log(e);
  }


  res.redirect("/home");

});

app.get("/accidental", function(req, res){

  res.render("accidental");

});

app.post("/accidental", async function(req,res){
  var name = req.body.name;
  var gender = req.body.gender;
  var age = req.body.age;
  var cno = req.body.cno;
  var address = req.body.address;
  var pin = req.body.pin;
  var occupation = req.body.occupation;
  var status = req.body.status;
  var income = req.body.income;
  var docname = req.body.docname;
  var witnessname = req.body.witnessname;
  var passengername = req.body.passengername;
  var pedestrianname = req.body.pedestrianname;
  var bodyshop = req.body.bodyshop;
  var date = req.body.date;
  var location = req.body.location;
  var eventlat;
  var eventlong;
  var currentlat = parseFloat(req.body.latitude);
  var currentlong = parseFloat(req.body.longitude);
  console.log(req.body);
  const result9 = await geoCoder.geocode(location);
      eventlat = result9[0].latitude;
      eventlong = result9[0].longitude;
  console.log(result9[0]);


  try {
    const results8 = await session
        .run(`WITH point({latitude: $eventlat ,longitude: $eventlong }) AS p1, point({latitude: $currentlat, longitude: $currentlong }) AS p2
              RETURN distance(p1,p2) AS dist`, {
                     eventlat: eventlat,
                     eventlong: eventlong,
                     currentlat: currentlat,
                     currentlong: currentlong
                   })
                   console.log(results8.records[0].get('dist'));
                   var dist1 = Math.floor(results8.records[0].get('dist'));
                   var dist = dist1/1000;

                   await session
                     .run('CREATE (n:A_User { name: $name , gender: $gender , age: $age, contact: $cno , address: $address , pin: $pin , occupation: $occupation , status: $status , income: $income, distance: $dist})', {
                       name: name,
                       gender: gender,
                       age: age,
                       cno: cno,
                       address: address,
                       pin: pin,
                       occupation: occupation,
                       status: status,
                       income: income,
                       dist: dist
                   })
                   await session
                         .run('CREATE (a:A_Doctor {name: $docname})', {
                           docname: docname
                         })
                   await session
                             .run('CREATE (b:A_Witness {name: $witnessname, date: $date, bodyshop: $bodyshop , location: $location})', {
                                 witnessname: witnessname,
                                 date: date,
                                 bodyshop: bodyshop,
                                 location: location
                               })
                   await session
                             .run('CREATE (a:A_Passenger {name: $passengername})', {
                                 passengername: passengername
                               })
                   await session
                           .run('CREATE (a:A_Pedestrian {name: $pedestrianname})', {
                                 pedestrianname: pedestrianname
                               })
                               console.log('before');

                               await session
                                        .run(`MATCH (n:A_User),(a:A_Doctor),(b:A_Witness),(c:A_Passenger),(d:A_Pedestrian)
                                             WHERE n.name = $uname AND a.name = $dname AND b.name = $wname AND c.name = $paname AND d.name = $pename
                                             CREATE (n)-[pr:CHECKED_BY]->(a), (n)-[pf:WITNESSED_BY]->(b), (n)-[pp:ACCOMPANIED_BY]->(c), (n)-[pq:WATCHED_BY]->(d)
                                             RETURN n,a,b,c,d`, {
                                               uname: name,
                                               dname: docname,
                                               wname: witnessname,
                                               paname: passengername,
                                               pename: pedestrianname
                                             })

                                             console.log('after');

                         const result = await session
                                     .run(`MATCH (a:A_Doctor),(b:A_Witness),(c:A_Passenger),(d:A_Pedestrian)
                                           WITH collect(a) AS a,collect(b) AS b,collect(c) AS c,collect(d) AS d
                                           WITH [val IN a WHERE val.name = $uname] AS duplicates1,[val IN b WHERE val.name = $uname] AS duplicates11,[val IN c WHERE val.name = $uname] AS duplicates12,[val IN d WHERE val.name = $uname] AS duplicates13
                                           RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11,size(duplicates12) AS duplicates12,size(duplicates13) AS duplicates13`,{uname: name})

                             const dcount1 = result.records[0].get('duplicates1').toNumber();
                             const wcount1 = result.records[0].get('duplicates11').toNumber();
                             const pacount1 = result.records[0].get('duplicates12').toNumber();
                             const pecount1 = result.records[0].get('duplicates13').toNumber();
                             var count1=0;
                             if(dcount1>0 || wcount1>0 || pacount1>0 || pecount1>0){
                               count1 = 1;
                             }

                             const result1 = await session
                                      .run(`MATCH (a:A_User),(b:A_Witness),(c:A_Passenger),(d:A_Pedestrian)
                                            WITH collect(a) AS a,collect(b) AS b,collect(c) AS c,collect(d) AS d
                                            WITH [val IN a WHERE val.name = $docname] AS duplicates1,[val IN b WHERE val.name = $docname] AS duplicates11,[val IN c WHERE val.name = $docname] AS duplicates12,[val IN d WHERE val.name = $docname] AS duplicates13
                                            RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11,size(duplicates12) AS duplicates12,size(duplicates13) AS duplicates13`,{docname: docname})

                              const ucount2 = result1.records[0].get('duplicates1').toNumber();
                              const wcount2 = result1.records[0].get('duplicates11').toNumber();
                              const pacount2 = result1.records[0].get('duplicates12').toNumber();
                              const pecount2 = result1.records[0].get('duplicates13').toNumber();
                              var count2=0;
                              if(ucount2>0 || wcount2>0 || pacount2>0 || pecount2>0){
                                count2 = 1;
                              }
                 console.log('2');
                 try {

                   const result4 = await session
                            .run(`MATCH (a:A_Doctor),(b:A_Witness)
                                  WITH collect(a) AS a,collect(b) AS b
                                  WITH [val IN a WHERE val.name = $paname] AS duplicates1,[val IN b WHERE val.name = $paname] AS duplicates11
                                  RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11`,{paname: passengername})

                    const dcount4 = result4.records[0].get('duplicates1').toNumber();
                    const wcount4 = result4.records[0].get('duplicates11').toNumber();

                    const result41 = await session
                             .run(`MATCH (c:A_User),(d:A_Pedestrian)
                                   WITH collect(c) AS c,collect(d) AS d
                                   WITH [val IN c WHERE val.name = $paname] AS duplicates12,[val IN d WHERE val.name = $paname] AS duplicates13
                                   RETURN size(duplicates12) AS duplicates12,size(duplicates13) AS duplicates13`,{paname: passengername})

                    const ucount4 = result41.records[0].get('duplicates12').toNumber();
                    const pecount4 = result41.records[0].get('duplicates13').toNumber();
                    var count4=0;
                    if(dcount4>0 || wcount4>0 || ucount4>0 || pecount4>0){
                      count4 = 1;
                    }
                    console.log('3');
                    const result5 = await session
                             .run(`MATCH (a:A_Doctor),(b:A_Witness)
                                   WITH collect(a) AS a,collect(b) AS b
                                   WITH [val IN a WHERE val.name = $pename] AS duplicates1,[val IN b WHERE val.name = $pename] AS duplicates11
                                   RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11`,{pename: pedestrianname})

                     const dcount5 = result5.records[0].get('duplicates1').toNumber();
                     const wcount5 = result5.records[0].get('duplicates11').toNumber();

                     const result51 = await session
                              .run(`MATCH (c:A_Passenger),(d:A_User)
                                    WITH collect(c) AS c,collect(d) AS d
                                    WITH [val IN c WHERE val.name = $pename] AS duplicates12,[val IN d WHERE val.name = $pename] AS duplicates13
                                    RETURN size(duplicates12) AS duplicates12,size(duplicates13) AS duplicates13`,{pename: pedestrianname})
                     const pacount5 = result51.records[0].get('duplicates12').toNumber();
                     const ucount5 = result51.records[0].get('duplicates13').toNumber();
                     var count5=0;
                     if(dcount5>0 || wcount5>0 || pacount3>0 || ucount3>0){
                       count5 = 1;
                     }

                     console.log('4');
                   const result3 = await session
                            .run(`MATCH (a:A_Doctor),(b:A_User),(c:A_Passenger),(d:A_Pedestrian)
                                  WITH collect(a) AS a,collect(b) AS b,collect(c) AS c,collect(d) AS d
                                  WITH [val IN a WHERE val.name = $wname] AS duplicates1,[val IN b WHERE val.name = $wname] AS duplicates11,[val IN c WHERE val.name = $wname] AS duplicates12,[val IN d WHERE val.name = $wname] AS duplicates13
                                  RETURN size(duplicates1) AS duplicates1, size(duplicates11) AS duplicates11,size(duplicates12) AS duplicates12,size(duplicates13) AS duplicates13`,{wname: witnessname})

                    const dcount3 = result3.records[0].get('duplicates1').toNumber();
                    const ucount3 = result3.records[0].get('duplicates11').toNumber();
                    const pacount3 = result3.records[0].get('duplicates12').toNumber();
                    const pecount3 = result3.records[0].get('duplicates13').toNumber();
                    var count3=0;
                    if(dcount3>0 || ucount3>0 || pacount3>0 || pecount3>0){
                      count3 = 1;
                    }

                    console.log('5');

                 } catch (e) {
                   console.log(e);
                 }


                             if((count1>0 && count2>0 && count3>0 && count4>0) || (count1>0 && count2>0 && count3>0 && count5>0) || (count1>0 && count2>0 && count4>0 && count5>0) || (count1>0 && count3>0 && count4>0 && count5>0)){

                               await session
                                     .run(`MATCH (n:A_User { name: $uname })
                                           SET n.type = $type`,{
                                             uname: name,
                                             type: 'fraud'
                                           })

                             }
                             else if(count2>0 && count3>0 && count4>0 && count5>0){
                               await session
                                     .run(`MATCH (n:A_User { name: $uname })
                                           SET n.type = $type`,{
                                             uname: name,
                                             type: 'fraud'
                                           })
                             }
                             else {
                               await session
                                     .run(`MATCH (n:A_User { name: $uname })
                                           SET n.type = $type`,{
                                             uname: name,
                                             type: 'not fraud'
                                           })
                             }



  } catch (e) {
    console.log(e);
  }


    res.redirect("/home");

});
// app.post("/Signin", async function(req,res){
//
// });
app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
