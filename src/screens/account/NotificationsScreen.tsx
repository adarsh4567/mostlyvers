import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { Colors, Fonts, Radii } from '../../theme';
import { useGetNotificationsQuery, useReadAllNotificationsMutation, useReadNotificationMutation } from '../../store/apiSlice';

export default function NotificationsScreen() {
	const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery();
	const [read] = useReadNotificationMutation(); const [readAll] = useReadAllNotificationsMutation();
	return <View style={styles.container}><Header title="Notifications" leftComponent={<BackButton/>} rightComponent={data?.unreadCount ? <TouchableOpacity onPress={() => readAll()}><Text style={styles.readAll}>READ ALL</Text></TouchableOpacity> : undefined}/>
		{isLoading ? <ActivityIndicator style={styles.loading} color={Colors.accent}/> : <FlatList data={data?.items || []} keyExtractor={item => item.id} refreshing={isFetching} onRefresh={refetch} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>} renderItem={({ item }) => <TouchableOpacity style={[styles.card, !item.readAt && styles.unread]} onPress={() => !item.readAt && read(item.id)}><View style={styles.icon}><Ionicons name="notifications-outline" size={20} color={Colors.primary}/></View><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text></View>{!item.readAt && <View style={styles.dot}/>}</TouchableOpacity>}/>}
	</View>;
}

const styles = StyleSheet.create({ container:{flex:1,backgroundColor:Colors.background},loading:{marginTop:40},list:{padding:14,paddingBottom:110},empty:{textAlign:'center',color:Colors.textSecondary,fontFamily:Fonts.body,marginTop:40},card:{flexDirection:'row',gap:11,backgroundColor:Colors.cardBg,borderRadius:Radii.card,padding:13,marginBottom:10,borderWidth:1,borderColor:Colors.border},unread:{borderColor:Colors.accent},icon:{width:38,height:38,borderRadius:19,backgroundColor:'#F5E9DA',alignItems:'center',justifyContent:'center'},copy:{flex:1},title:{fontFamily:Fonts.bodyBold,color:Colors.textPrimary,fontSize:14},body:{fontFamily:Fonts.body,color:Colors.textSecondary,fontSize:12,lineHeight:17,marginTop:3},date:{fontFamily:Fonts.body,color:Colors.textMuted,fontSize:9,marginTop:6},dot:{width:8,height:8,borderRadius:4,backgroundColor:Colors.accent,marginTop:5},readAll:{fontFamily:Fonts.bodyBold,color:Colors.primary,fontSize:10} });
