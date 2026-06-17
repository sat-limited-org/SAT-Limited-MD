    if (command === "tts") {

        const textToSpeak = args.join(" ").trim()

        if (!textToSpeak) {
            return sock.sendMessage(from, {
                text: "❌ Give text"
            })
        }

        const fileName =
            `./temp/${Date.now()}.mp3`

        try {

            const gtts = new gTTS(textToSpeak, "en")

            gtts.save(fileName, async () => {

                try {

                    await sock.sendMessage(from, {
                        audio: {
                            url: fileName
                        },
                        mimetype: "audio/mpeg"
                    }, { quoted: msg })

                } catch (e) {
                    console.log("TTS send error:", e)
                }

                safeDelete(fileName)
            })

        } catch (e) {

            console.log("TTS error:", e)

            return sock.sendMessage(from, {
                text: "❌ Failed to generate TTS"
            })
        }
    }
