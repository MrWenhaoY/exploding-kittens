# Game with only skips
 - You have no cards in hand: draw
 - There is only 1 card left / you know the top card is an exploding kitten: skip
 - There are x cards left, you have y skips in hand, opponent never plays any cards:
     - Draw: 1/x chance of losing. (x-1)/x chance of getting +1 skip
     - Skip: -1 skip, 1/x chance of winning
 - Let winChance(deckSize, skipCount): win percentage // Assuming opponent never plays cards
    - winChance(1, 0) = 0 // You lose: you must draw and die
    - winChance(1, y) = 1 // Assuming y > 0; you skip and your opponent loses
    - winChance(x, 0) = (x-1)/x * [(1/x-1) + (x-2)/(x-1) * winChance(x-2, 1)]
    - winChance(x, y) = 
       - draw: (x-1)/x * [1/(x-1) + (x-2)/(x-1) * winChance(x-2, 1)]
       - skip: 1/x + (x-1)/x * winChance(x-1, y-1)
 - Try running `results = calc.winChanceDP(15,5)`

 TODO:
  - Add a new card
  - Skips with intelligent opponent
  - Maybe do out analysis of winrate for e exploding kittens and x cards total in deck