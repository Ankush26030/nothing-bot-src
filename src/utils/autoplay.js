module.exports = {
    VibesAutoplay: async function(client, player) {
        const MAX_HISTORY = 15;
        const ARTIST_COOLDOWN = 3;
        
        const track = player.data.get("autoplaySystem");
        if (!track) return;
        
        let history = player.data.get("playHistory") || [];
        let artistCooldown = player.data.get("artistCooldown") || {};
        
        const searchQueries = [
            `${track.author} songs`,
            `${track.author} popular songs`,
            `music similar to ${track.author}`,
            `songs like ${track.title}`,
            `${track.title} radio mix`,
            `artist radio ${track.author}`,
            `${track.author} deep cuts`,
            `${track.author} b-sides`,
            `${track.author} collaborations`,
            `${track.author} featuring`
        ];
        
        for (const query of searchQueries) {
            try {
                let res = await player.search(query, {
                    engine: "youtube",
                    requester: track.requester,
                });
                
                if (res && res.tracks.length > 0) {
                    const filteredTracks = res.tracks.filter(t => {
                        const currentTitle = track.title.toLowerCase();
                        const currentAuthor = track.author.toLowerCase();
                        const testTitle = t.title.toLowerCase();
                        const testAuthor = t.author.toLowerCase();
                        
                        const isInHistory = history.some(h => 
                            h.title.toLowerCase() === testTitle && 
                            h.author.toLowerCase() === testAuthor
                        );
                        
                        return (
                            testTitle !== currentTitle &&
                            !testTitle.includes('live') &&
                            !testTitle.includes('cover') &&
                            !testTitle.includes('reaction') &&
                            !testTitle.includes(currentTitle) &&
                            !(testAuthor === currentAuthor && 
                              testTitle.includes(currentTitle.split(' ')[0])) &&
                            !isInHistory &&
                            (artistCooldown[testAuthor] || 0) < ARTIST_COOLDOWN
                        );
                    });
                    
                    if (filteredTracks.length > 0) {
                        const randomIndex = Math.floor(Math.random() * Math.min(filteredTracks.length, 5));
                        const selectedTrack = filteredTracks[randomIndex];
                        
                        player.queue.add(selectedTrack);
                        
                        player.data.set("autoplaySystem", {
                            title: selectedTrack.title,
                            author: selectedTrack.author,
                            requester: track.requester
                        });

                        // Update history
                        history.unshift({
                            title: selectedTrack.title,
                            author: selectedTrack.author
                        });
                        if (history.length > MAX_HISTORY) history.pop();
                        player.data.set("playHistory", history);

                        // Update artist cooldown
                        Object.keys(artistCooldown).forEach(artist => {
                            artistCooldown[artist] += 1;
                        });
                        artistCooldown[selectedTrack.author] = 0;
                        player.data.set("artistCooldown", artistCooldown);
                        
                        if (!player.playing && !player.paused) {
                            player.play();
                        }
                        
                        console.log(`Autoplay added: ${selectedTrack.title} by ${selectedTrack.author}`);
                        return;
                    }
                }
            } catch (error) {
                console.error(`Search failed for query: ${query}`, error);
                continue;
            }
        }
        
        console.log("Autoplay: No suitable tracks found");
    }
}