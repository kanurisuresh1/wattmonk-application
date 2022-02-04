## BugsRelease_V1.1.14_b1

## Bugs Completed

1.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 2.https://github.com/techwattmonk/wattmonkdashboard/issues/1709 3.https://github.com/techwattmonk/wattmonkdashboard/issues/1708 4.https://github.com/techwattmonk/wattmonkdashboard/issues/1706 5.https://github.com/techwattmonk/wattmonkdashboard/issues/1704 6.https://github.com/techwattmonk/wattmonkdashboard/issues/1701 7.https://github.com/techwattmonk/wattmonkdashboard/issues/1700 8.https://github.com/techwattmonk/wattmonkdashboard/issues/1698 9.https://github.com/techwattmonk/wattmonkdashboard/issues/1697 10.https://github.com/techwattmonk/wattmonkdashboard/issues/1696 11.https://github.com/techwattmonk/wattmonkdashboard/issues/1695 12.https://github.com/techwattmonk/wattmonkdashboard/issues/1694 13.https://github.com/techwattmonk/wattmonkdashboard/issues/1692 14.https://github.com/techwattmonk/wattmonkdashboard/issues/1691 15.https://github.com/techwattmonk/wattmonkdashboard/issues/1689 16.https://github.com/techwattmonk/wattmonkdashboard/issues/1687 17.https://github.com/techwattmonk/wattmonkdashboard/issues/1686 18.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 19.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 20.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 21.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 22.https://github.com/techwattmonk/wattmonkdashboard/issues/1710 23.https://github.com/techwattmonk/wattmonkdashboard/issues/1710

## TestRelease_V1.1.14.3

## New Funtionality to be tested:

Zenith Specific Requirements:-

1. Admins to be able to view all data added by sales manager below him.
2. We want to remove the need for sales managers to approve or push on the surveys to be created into designs, have them sent to a master electrician (or one of our back office people we have trained to view them) but we do not want the sales managers needing to do anything for the process to begin. Removed Raise permit request button from Sales Manager.
3. Admins not able to view each other projects.
4. Anyone can do and create Surveys.
5. Surveyor to be able to add a Survey but not able to assign the survey to other person.
6. Removed Raise permit request button for Sales Manager.
7. Because of client role customization role names displayed everywhere to be fixed.
8. Type of project to be checked during add survey Residential, Commercial, Detached building or shop, Carport.

Please test these new task for Zenith specific client:

1. For all zenith users that are logging, who parent id is of Zenith client everywhere Permit has to be replaced with Designs.
2. Super Admin and Admins adds Sales Representatives then in the list of team members in front of Sales Representatives row give a button to Assign Sales Manager. So Super Admin and admins assign each Sales Representatives to a Sales Manager.
3. Super Admin adds Sales Manager then in the list of team members in front of Sales Manager row give a button to Assign Admin. So Super Admin assign each Sales Manager to a Admin.
4. Admins not able to view each other projects. (All admins should see each other's Sales Manager / Sales Representative / Projects.)

## New Funtionality to be tested:

1. Type of project : Residential / Detached building or shop/ carport — Add in (Survey, Design)
2. Survey all information to be displayed onto web detail page. If any information is missing it should not be displayed else it should be displayed.
3. All wattmonk admins to be added to chat group and chat option to be available to client on outsourcing.
4. Surveyor to be able to add a Survey but not able to assign the survey to other person.
5. During Permit and Prelim design request completion by designer he should be able to upload .zip or pdf file. Detail page of design request to reflect accordingly.
6. Designers, Analysts, Surveyors to have Inbox icon along with count badge in Navbar which will redirect user to his Inbox. Inbox icon to have unread messages badge count.

## hierarchy wise functionality to be tested from team module:

Zenith would want following changes to be done to their survey app in iOS.

1. Change Surveyor to sales rep
2. Change design manager to sales manager
3. Add Master electrician
4. Admin

Hierarachy: Admin ->Master electrician -> sales manager -> sales reps
Admin adds design managers and master electrician.
Sales managers add Sales rep. Sales managers can only see the work of the sales rep they added to the platform. So different sales managers have their own group of sales reps.
Master electrician sees all the surveys submitted and fills in the permit form before sending it to Wattmonk.
Sales reps: Guys who do the survey but also have the + button to add and do a survey themselves without being assigned.

1. Create Super Admin (Specific Client), Create his two admins, Admin will create two sales managers, Sales manager will create Sales representatives. Check that sales managers can only view their created Sales Representatives when assigning and in team module and Surveys created by specific Sales Manager or the sales representatives below them will only be able to view.
2. Creation of Survey by Sales Representatives.
3. Sales representatives to start surveys and complete them.
4. Details of Survey to be properly visible on web and mobile.
5. Manager electrician to be able to view all sales manager surveys and create permit request from completed surveys.

## Things to be cross checked:

Site assessment, sales proposal, permit, PE Stamp request all jobs can be raised with same email and address combination.
Delivered items in list to have actual delivery date instead of “Updated 10 days ago”.
When any design request or pe stamp request is put on hold then in list of all activities, the activity log of the request should contain the on hold reason.
Increase the length of the address field during on boarding process.
Once review assigned to an analyst then admin not getting an option to self assign review.
Designer should be able to submit a design request by uploading a zip file also.
Links provided in comments to be clickable. Rest of the content is non actionable.

## Bugs Completed

1.https://github.com/techwattmonk/wattmonkdashboard/issues/1653 2.https://github.com/techwattmonk/wattmonkdashboard/issues/1652 3.https://github.com/techwattmonk/wattmonkdashboard/issues/1651 4.https://github.com/techwattmonk/wattmonkdashboard/issues/1649 5.https://github.com/techwattmonk/wattmonkdashboard/issues/1648 6.https://github.com/techwattmonk/wattmonkdashboard/issues/1647 7.https://github.com/techwattmonk/wattmonkdashboard/issues/1646 8.https://github.com/techwattmonk/wattmonkdashboard/issues/1644 9.https://github.com/techwattmonk/wattmonkdashboard/issues/1643 10.https://github.com/techwattmonk/wattmonkdashboard/issues/1642 11.https://github.com/techwattmonk/wattmonkdashboard/issues/1639 12.https://github.com/techwattmonk/wattmonkdashboard/issues/1636 13.https://github.com/techwattmonk/wattmonkdashboard/issues/1634 14.https://github.com/techwattmonk/wattmonkdashboard/issues/1633 15.https://github.com/techwattmonk/wattmonkdashboard/issues/1632 16.https://github.com/techwattmonk/wattmonkdashboard/issues/1630 17.https://github.com/techwattmonk/wattmonkdashboard/issues/1629 18.https://github.com/techwattmonk/wattmonkdashboard/issues/1628 19.https://github.com/techwattmonk/wattmonkdashboard/issues/1626 20.https://github.com/techwattmonk/wattmonkdashboard/issues/1624 21.https://github.com/techwattmonk/wattmonkdashboard/issues/1622 22.https://github.com/techwattmonk/wattmonkdashboard/issues/1620 23.https://github.com/techwattmonk/wattmonkdashboard/issues/1619 24.https://github.com/techwattmonk/wattmonkdashboard/issues/1616 25.https://github.com/techwattmonk/wattmonkdashboard/issues/1615 26.https://github.com/techwattmonk/wattmonkdashboard/issues/1613 27.https://github.com/techwattmonk/wattmonkdashboard/issues/1609 28.https://github.com/techwattmonk/wattmonkdashboard/issues/1602 29.https://github.com/techwattmonk/wattmonkdashboard/issues/1599 30.https://github.com/techwattmonk/wattmonkdashboard/issues/1596 31.https://github.com/techwattmonk/wattmonkdashboard/issues/1594 32.https://github.com/techwattmonk/wattmonkdashboard/issues/1593 33.https://github.com/techwattmonk/wattmonkdashboard/issues/1592 34.https://github.com/techwattmonk/wattmonkdashboard/issues/1591 35.https://github.com/techwattmonk/wattmonkdashboard/issues/1590 36.https://github.com/techwattmonk/wattmonkdashboard/issues/1589 37.https://github.com/techwattmonk/wattmonkdashboard/issues/1588 38.https://github.com/techwattmonk/wattmonkdashboard/issues/1587 39.https://github.com/techwattmonk/wattmonkdashboard/issues/1586 40.https://github.com/techwattmonk/wattmonkdashboard/issues/1583 41.https://github.com/techwattmonk/wattmonkdashboard/issues/1581 42.https://github.com/techwattmonk/wattmonkdashboard/issues/1580 43.https://github.com/techwattmonk/wattmonkdashboard/issues/1578 44.https://github.com/techwattmonk/wattmonkdashboard/issues/1577 45.https://github.com/techwattmonk/wattmonkdashboard/issues/1574 46.https://github.com/techwattmonk/wattmonkdashboard/issues/1573 47.https://github.com/techwattmonk/wattmonkdashboard/issues/1570 48.https://github.com/techwattmonk/wattmonkdashboard/issues/1567 49.https://github.com/techwattmonk/wattmonkdashboard/issues/1566 50.https://github.com/techwattmonk/wattmonkdashboard/issues/1565 51.https://github.com/techwattmonk/wattmonkdashboard/issues/1563 52.https://github.com/techwattmonk/wattmonkdashboard/issues/1562 53.https://github.com/techwattmonk/wattmonkdashboard/issues/1561 54.https://github.com/techwattmonk/wattmonkdashboard/issues/1559 55.https://github.com/techwattmonk/wattmonkdashboard/issues/1556 56.https://github.com/techwattmonk/wattmonkdashboard/issues/1554 57.https://github.com/techwattmonk/wattmonkdashboard/issues/1553 58.https://github.com/techwattmonk/wattmonkdashboard/issues/1552 59.https://github.com/techwattmonk/wattmonkdashboard/issues/1551 60.https://github.com/techwattmonk/wattmonkdashboard/issues/1548 61.https://github.com/techwattmonk/wattmonkdashboard/issues/1546 62.https://github.com/techwattmonk/wattmonkdashboard/issues/1545 63.https://github.com/techwattmonk/wattmonkdashboard/issues/1544 64.https://github.com/techwattmonk/wattmonkdashboard/issues/1542 65.https://github.com/techwattmonk/wattmonkdashboard/issues/1541 66.https://github.com/techwattmonk/wattmonkdashboard/issues/1536 67.https://github.com/techwattmonk/wattmonkdashboard/issues/1530 68.https://github.com/techwattmonk/wattmonkdashboard/issues/1529 69.https://github.com/techwattmonk/wattmonkdashboard/issues/1527 70.https://github.com/techwattmonk/wattmonkdashboard/issues/1522 71.https://github.com/techwattmonk/wattmonkdashboard/issues/1521 72.https://github.com/techwattmonk/wattmonkdashboard/issues/1515 73.https://github.com/techwattmonk/wattmonkdashboard/issues/1514 74.https://github.com/techwattmonk/wattmonkdashboard/issues/1507 75.https://github.com/techwattmonk/wattmonkdashboard/issues/1498 76.https://github.com/techwattmonk/wattmonkdashboard/issues/1495 77.https://github.com/techwattmonk/wattmonkdashboard/issues/1494 78.https://github.com/techwattmonk/wattmonkdashboard/issues/1491 79.https://github.com/techwattmonk/wattmonkdashboard/issues/1485 80.https://github.com/techwattmonk/wattmonkdashboard/issues/1480 81.https://github.com/techwattmonk/wattmonkdashboard/issues/1460 82.https://github.com/techwattmonk/wattmonkdashboard/issues/1448 83.https://github.com/techwattmonk/wattmonkdashboard/issues/1441 84.https://github.com/techwattmonk/wattmonkdashboard/issues/1437 85.https://github.com/techwattmonk/wattmonkdashboard/issues/1421 86.https://github.com/techwattmonk/wattmonkdashboard/issues/1418 87.https://github.com/techwattmonk/wattmonkdashboard/issues/1416 88.https://github.com/techwattmonk/wattmonkdashboard/issues/1496 89.https://github.com/techwattmonk/wattmonkdashboard/issues/1386 90.https://github.com/techwattmonk/wattmonkdashboard/issues/1362 91.https://github.com/techwattmonk/wattmonkdashboard/issues/1357 92.https://github.com/techwattmonk/wattmonkdashboard/issues/1340 93.https://github.com/techwattmonk/wattmonkdashboard/issues/1288 94.https://github.com/techwattmonk/wattmonkdashboard/issues/1284 95.https://github.com/techwattmonk/wattmonkdashboard/issues/1234 96.https://github.com/techwattmonk/wattmonkdashboard/issues/1205 97.https://github.com/techwattmonk/wattmonkdashboard/issues/1158 98.https://github.com/techwattmonk/wattmonkdashboard/issues/977 99.https://github.com/techwattmonk/wattmonkdashboard/issues/846 100.https://github.com/techwattmonk/wattmonkdashboard/issues/845 101.https://github.com/techwattmonk/wattmonkdashboard/issues/844 102.https://github.com/techwattmonk/wattmonkdashboard/issues/839 103.https://github.com/techwattmonk/wattmonkdashboard/issues/838 104.https://github.com/techwattmonk/wattmonkdashboard/issues/837 105.https://github.com/techwattmonk/wattmonkdashboard/issues/805 106.https://github.com/techwattmonk/wattmonkdashboard/issues/796 107.https://github.com/techwattmonk/wattmonkdashboard/issues/790 108.https://github.com/techwattmonk/wattmonkdashboard/issues/761 109.https://github.com/techwattmonk/wattmonkdashboard/issues/739 110.https://github.com/techwattmonk/wattmonkdashboard/issues/733 111.https://github.com/techwattmonk/wattmonkdashboard/issues/732 112.https://github.com/techwattmonk/wattmonkdashboard/issues/731 113.https://github.com/techwattmonk/wattmonkdashboard/issues/719 114.https://github.com/techwattmonk/wattmonkdashboard/issues/699 115.https://github.com/techwattmonk/wattmonkdashboard/issues/667 116.https://github.com/techwattmonk/wattmonkdashboard/issues/666 117.https://github.com/techwattmonk/wattmonkdashboard/issues/626 118.https://github.com/techwattmonk/wattmonkdashboard/issues/607 119.https://github.com/techwattmonk/wattmonkdashboard/issues/378 120.https://github.com/techwattmonk/wattmonkdashboard/issues/206
