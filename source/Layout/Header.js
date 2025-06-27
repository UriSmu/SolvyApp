import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Logo from '../../assets/Logo.png';
import { useUserProfile } from '../context/UserProfileContext';

export default function Header() {
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

const styles = StyleSheet.create({
    scrollContainer: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    logoImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    profileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#007cc0',
    },
});