export default function OlvideMiContrasenia() {
    const { profile } = useUserProfile();

    return (
        <>
            <StatusBar style="auto" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Image source={Logo} style={styles.logoImage} />
                    <View style={styles.profileContainer}>
                        {profile && profile.fotopersonal ? (
                            <Image
                                source={{ uri: profile.fotopersonal }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <FontAwesome name="user-circle-o" size={40} color="#003f5c" />
                        )}
                    </View>
                </View>
            </ScrollView>
        </>
    );
}