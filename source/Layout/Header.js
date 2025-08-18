import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Logo from '../../assets/Logo.png';
import { useUserProfile } from '../context/UserProfileContext';
import { useNavigation } from '@react-navigation/native';

export default function Header({ perfilScreen = "Perfil" }) {
    const { profile } = useUserProfile();
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            <Image source={Logo} style={styles.logoImage} />
            <TouchableOpacity
                style={styles.profileContainer}
                onPress={() => navigation.navigate(perfilScreen)}
            >
                {profile && profile.fotopersonal ? (
                    <Image
                        source={{ uri: profile.fotopersonal }}
                        style={styles.profileImage}
                    />
                ) : (
                    <FontAwesome name="user-circle-o" size={40} color="#003f5c" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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