const a = `
(round((
        (select cast(sum("firstPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "firstPlayerId" = id) 
        + 
        (select cast(sum("secondPlayerScore") as numeric)
        from "pair_game_quiz" 
        where "secondPlayerId" = id))
         /
         ((select cast(count(*) as numeric)
        from "pair_game_quiz" 
        where "firstPlayerId" = id) 
        + 
        (select cast(count(*) as numeric)
        from "pair_game_quiz" 
        where "secondPlayerId" = id)), 2))
        as avgScores,
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = id) 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = id))
        as gamesCount,
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = id
        and "firstPlayerScore" > "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = id
        and "firstPlayerScore" < "secondPlayerScore"))
        as winsCount,
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = id
        and "firstPlayerScore" < "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = id
        and "firstPlayerScore" > "secondPlayerScore"))
        as lossesCount,
        
        ((select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "firstPlayerId" = id
        and "firstPlayerScore" = "secondPlayerScore") 
        + 
        (select cast(count(*) as integer)
        from "pair_game_quiz" 
        where "secondPlayerId" = id
        and "firstPlayerScore" = "secondPlayerScore"))
        as drawsCount`