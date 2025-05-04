import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income <= 60000 and income >= 50000 order by income desc, lastName asc, firstName asc LIMIT 10;`
}

function problem2() {
  return prisma.$queryRaw`SELECT e.sin, b.branchName, e.salary, CAST(m.salary - e.salary AS CHAR) AS "Salary Diff" FROM Employee e JOIN Branch b ON e.branchNumber = b.branchNumber JOIN Employee m ON b.managerSIN = m.sin WHERE b.branchName IN ('London', 'Berlin') ORDER BY (m.salary - e.salary) DESC LIMIT 10;`
}

function problem3() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income >= (select max(income) from Customer where lastName="Butler") * 2 order by lastName asc, firstName asc limit 10;`
}

function problem4() {
  return prisma.$queryRaw`SELECT c.customerID, c.income, a.accNumber, a.branchNumber FROM Customer c JOIN Owns o ON c.customerID = o.customerID JOIN Account a ON o.accNumber = a.accNumber WHERE c.income > 80000 AND c.customerID IN (SELECT Owns.customerID FROM Owns JOIN Account ON Owns.accNumber = Account.accNumber WHERE Account.branchNumber IN (1,2) GROUP BY Owns.customerID HAVING COUNT(DISTINCT Account.branchNumber) = 2) ORDER BY c.customerID ASC, a.accNumber ASC limit 10;`
}

function problem5() {
  return prisma.$queryRaw`select c.customerID, a.type, a.accNumber, a.balance from Customer c join Owns o on c.customerID = o.customerID join Account a on a.accNumber = o.accNumber where a.type = 'BUS' or a.type = 'SAV' order by c.customerID, a.type, a.accNumber limit 10;`
}

function problem6() {
  return prisma.$queryRaw`select b.branchName, a.accNumber, a.balance from Account a join Branch b on a.branchNumber = b.branchNumber where a.balance > 100000 and b.managerSIN = (select sin from Employee where firstName = 'Phillip' and lastName = 'Edwards') order by accNumber limit 10;`
}

function problem7() {
  return prisma.$queryRaw`select distinct O.customerID from Owns O join Account A on O.accNumber=A.accNumber join Branch B on A.branchNumber=B.branchNumber where B.branchNumber=3 and O.customerID not in(select O1.customerID from Owns O1 join Owns O2 on O1.accNumber=O2.accNumber where O2.customerID in(select O3.customerID from Owns O3 join Account A on O3.accNumber=A.accNumber join Branch B on A.branchNumber=B.branchNumber where B.branchNumber=1)) order by O.customerID asc limit 10`;
}

function problem8() {
  return prisma.$queryRaw`select e.sin,e.firstName,e.lastName,e.salary,b.branchName from Employee e left join Branch b on e.sin=b.managerSIN where e.salary>50000 order by b.branchName desc,e.firstName asc limit 10`;
}

function problem9() {
  return prisma.$queryRaw`select e.sin,e.firstName,e.lastName,e.salary,b.branchName from Employee e join Branch b on e.sin=b.managerSIN where e.salary>50000 union select e.sin,e.firstName,e.lastName,e.salary,null from Employee e join Branch b on e.branchNumber=b.branchNumber where e.salary>50000 and e.sin<>b.managerSIN order by branchName desc,firstName asc limit 10`;
}

function problem10() {
  return prisma.$queryRaw`select c.customerID,c.firstName,c.lastName,c.income from Customer c where c.income>5000 and not exists(select * from Account A join Owns O on A.accNumber=O.accNumber where O.customerID=(select h.customerID from Customer h where h.firstName='Helen' and h.lastName='Morgan') and not exists(select * from Account X join Owns Y on X.accNumber=Y.accNumber where Y.customerID=c.customerID and X.branchNumber=A.branchNumber)) order by c.income desc limit 10`;
}

function problem11() {
  return prisma.$queryRaw`select e.sin,e.firstName,e.lastName,e.salary from Employee e where e.branchNumber=4 order by e.salary asc limit 1`;
}

function problem14() {
  return prisma.$queryRaw`select CAST(sum(salary) AS CHAR) as 'sum of employees salaries' from Employee where branchNumber = (select branchNumber from Branch where branchName = 'Moscow')`;
}

function problem15() {
  return prisma.$queryRaw`select c.customerID,c.firstName,c.lastName from Customer c join Owns o on c.customerID=o.customerID join Account a on o.accNumber=a.accNumber group by c.customerID,c.firstName,c.lastName having count(distinct a.branchNumber)=4 order by c.lastName,c.firstName limit 10`;
}

function problem17() {
  return prisma.$queryRaw`select c.customerID,c.firstName,c.lastName,c.income,avg(a.balance) as "average account balance" from Customer c join Owns o on c.customerID=o.customerID join Account a on a.accNumber=o.accNumber where c.lastName like 'S%e%' group by c.customerID,c.firstName,c.lastName,c.income having count(o.accNumber)>=3 order by c.customerID limit 10`;
}

function problem18() {
  return prisma.$queryRaw`select a.accNumber,a.balance,sum(t.amount) as "sum of transaction amounts" from Account a join Transactions t on a.accNumber=t.accNumber where a.branchNumber=4 group by a.accNumber,a.balance having count(t.transNumber)>=10 order by sum(t.amount) limit 10`;
}


const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })