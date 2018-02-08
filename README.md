# hotelkoenig.net
A website for a generalized elo-system and to play the game online.

## Hotelkoenig-Elo-System (HELO)
### Inroduction
The helo-system is a generalization of the well known ELO system used in chess and Go. The advantages of the HELO system are:
 - firstly - it allows multiple players per game and 
 - secondly - the amount of HELO points and their distirbution over the places is arbitrarily adjustable.
E.g. in some circumstances it might be only of importance who wins the game whilest in others also second and third place might be of importance.


### Technical Description
The payoff is set before the game (e.g. 10 points for first place, 2 for second, 0 for third) which is the amount the player agree on gambling.

Final HELO movements for players participating in a game is twofold:
 - firstly - BuyIn
 Player have to buy the "ticket" to participate in the game that is set equal to their expected payoff.
 - secondly -Payoff
 Payoff is set to prior agreed structure and actual outcome of the game.
 
 The calculation of the expected payoff is a weighted average of all possible outcomes (and hypothetical HELO movements) where the probabilites are set with dividing the outcome of a n-person game in (n over 2) comparisons of two player.
 
 
## Play online

### Introduction
For the final stage of the website, it will be able to play hotelkoenig online from the first move the last.

### technical description
The program uses firebase as database (also for authentication. All relevant moves are written to firebase. Every move triggers cloud functions that process the associated actions with the playing of a tile (e.g. increase in price, merger) or with the buying of shares (e.g. change in primary shareholder).

Results of the processes are written back in the firebase database and displayed on the clients accordingly.

Overall, JavaScript (in browser and node.js for cloud functions) is used. Front-end uses HTML and CSS.

## Contribute / Feedback

Feel free to reach out to me if you want to contribute to the site, there are plenty to-do to make the site prettier or even more functional. We are also happy to hear about any feedback!

